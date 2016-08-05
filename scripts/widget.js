// Called when the user clicks on the browser action.
chrome.browserAction.onClicked.addListener(function (tab) {

    // get current selected tab
    chrome.tabs.query({active: true, currentWindow: true}, function (arrayOfTabs) {

        var activeTab = arrayOfTabs[0];

        var url = "https://api.github.com/repos/:owner/:repo/contents/:path?access_token=:token";

        var replacements = [
            ':owner',
            ':repo',
            ':path',
            ':token'
        ];

        // update url
        $.each(replacements, function (key, item) {
            var value = get(item.replace(':', ''));
            url = url.replace(item, value);
        });

        // get file content
        $.get(url, function (response) {

            var sha = response.sha,
                encodedContent = response.content,
                decodedContent = window.atob(encodedContent);

            // append header
            if (!isCurrentDateExists(decodedContent)) {
                decodedContent += getDateHeader();
            }

            // append url
            decodedContent += "[" + activeTab.title + "](" + activeTab.url + ") <br />";

            // decode content
            encodedContent = window.btoa(unescape(encodeURIComponent(decodedContent)));

            // prepare commit
            var commit = {
                sha: sha,
                content: encodedContent,
                message: "New link: " + activeTab.title,
                committer: {
                    "name": get('owner'),
                    "email": get('email')
                }
            };

            // send commit
            $.ajax({
                method: "PUT",
                url: url,
                headers: {
                    'Content-Type': 'application/json'
                },
                dataType: 'json',
                data: JSON.stringify(commit),
                success: function (response) {
                    setSuccessIcon();
                },
                error: function (error) {
                    setErrorIcon();
                }
            });

        }).fail(function () {
            setErrorIcon();
        });

        /**
         * Get value from storage
         *
         * @param val
         * @returns {string}
         */
        function get(val) {
            if (localStorage.getItem(val)) {
                return localStorage.getItem(val);
            }
            return "";
        }

        /**
         * Return date header
         *
         * @returns {string}
         */
        function getDateHeader() {
            return "<h3>" + getCurrentDate() + "</h3>";
        }

        /**
         * Check if current date already exists in the content
         *
         * @param content
         * @returns {boolean}
         */
        function isCurrentDateExists(content) {
            return (content.indexOf(getCurrentDate()) !== -1);
        }

        /**
         * Return current
         *
         * @returns {string}
         */
        function getCurrentDate() {
            var date = new Date();
            return monthNames()[date.getMonth()] + " " + pad(date.getDay()) + ", " + date.getFullYear();
        }

        /**
         * Return month names
         *
         * @returns {string[]}
         */
        function monthNames() {
            return [
                "Jan", "Feb", "Mar", "Apr", "May", "Jun",
                "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
            ];
        }

        /**
         * Pad 0 if number is less than 10
         *
         * @param n
         * @returns {string}
         */
        function pad(n) {
            return (n < 10) ? ("0" + n) : n;
        }

        /**
         * Set default icon
         */
        function setDefaultIcon() {
            sleep(1000).then(() => {
                chrome.browserAction.setIcon({path: "icons/standard-16.png"});
            });
        }

        /**
         * Set success icon
         */
        function setSuccessIcon() {
            chrome.browserAction.setIcon({path: "icons/check-mark.png"});
            setDefaultIcon()
        }

        /**
         * Set error icon
         */
        function setErrorIcon() {
            chrome.browserAction.setIcon({path: "icons/cross-mark.png"});
            setDefaultIcon();
        }

        /**
         * Sleep execution
         *
         * @param time
         * @returns {boolean}
         */
        function sleep(time) {
            return new Promise((resolve) => setTimeout(resolve, time));
        }
    });

});
