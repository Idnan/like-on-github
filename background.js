'use strict';

chrome.runtime.onMessage.addListener(function (req, sender, sendResponse) {

    var handler = {

        /**
         * Get active tab
         *
         * @returns {boolean}
         */
        getActiveTab: function () {

            chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
                sendResponse(tabs[0]);
            });

            return true;
        },

        /**
         * Get active tab
         *
         * @returns {boolean}
         */
        getStorage: function (params) {

            chrome.storage.sync.get(params.keys, function (items) {
                sendResponse(items);
            });

            return true;
        },
    };

    return handler[req.type](req.params);

});

chrome.browserAction.onClicked.addListener(function (tab) {
    // @todo open the like on github window
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {

    if (changeInfo.status !== 'loading')
        return;

    // Inject the required assets
    chrome.tabs.executeScript(tabId, {
        code: 'var injected = window.likeOnGithubInjected; window.likeOnGithubInjected = true; injected;',
        runAt: 'document_start'
    }, function (res) {

        if (chrome.runtime.lastError ||  // don't continue if error
            res[0]) // value of `injected` above: don't inject twice
            return;

        var cssFiles = [
                'assets/css/inject.css'
            ],
            jsFiles = [
                'assets/lib/jquery.js',
                'assets/lib/keymaster.js',
                'like-on-github.js'
            ];

        eachTask([function (cb) {
            return eachItem(cssFiles, inject('insertCSS'), cb);
        }, function (cb) {
            return eachItem(jsFiles, inject('executeScript'), cb);
        }]);

        function inject(fn) {
            return function (file, cb) {
                chrome.tabs[fn](tabId, {file: file, runAt: 'document_start'}, cb);
            };
        }
    });

});

function eachTask(tasks, done) {
    (function next() {
        var index = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];

        if (index === tasks.length) {
            done && done();
        } else {
            tasks[index](function () {
                return next(++index);
            });
        }
    })();
}

function eachItem(arr, iter, done) {
    var tasks = arr.map(function (item) {
        return function (cb) {
            return iter(item, cb);
        };
    });
    return eachTask(tasks, done);
}
