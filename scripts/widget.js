// Called when the user clicks on the browser action.
chrome.browserAction.onClicked.addListener(function (tab) {

    // get current selected tab
    chrome.tabs.query({active: true, currentWindow: true}, function (arrayOfTabs) {

        const activeTab = arrayOfTabs[0];

        const base_url = 'https://api.github.com/repos';

        const url = `${base_url}/${get('owner')}/${get('repo')}/contents/${get('path')}?access_token=${get('token')}`;

        fetch(url)
            .then(response => response.json())
            .then(response => {
                let sha = response.sha,
                    encodedContent = response.content,
                    decodedContent = decodeURIComponent(escape(window.atob(encodedContent)));

                // If the file is empty
                if (decodedContent.trim().length === 0)
                    decodedContent += '# today-i-liked \nContent that I liked. Saved using https://goo.gl/Wj595G \n';

                // append header
                if (!isCurrentDateExists(decodedContent))
                    decodedContent += getDateHeader();

                // append url
                decodedContent += `- [${activeTab.title}](${activeTab.url}) \n`;

                // decode content
                encodedContent = window.btoa(unescape(encodeURIComponent(decodedContent)));

                // prepare commit
                return {
                    sha: sha,
                    content: encodedContent,
                    message: `New link: ${activeTab.title}`,
                    committer: {
                        'name': get('committer_name'),
                        'email': get('committer_email')
                    }
                }
            }).then(commit => fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(commit)
        }))
            .then(success => setSuccessIcon())
            .catch(error => setErrorIcon());

        /**
         * Get value from storage
         *
         * @param val
         * @returns {string}
         */
        function get(val) {
            return localStorage.getItem(val) ? localStorage.getItem(val) : '';
        }

        /**
         * Return date header
         *
         * @returns {string}
         */
        function getDateHeader() {
            return `\n### ${getCurrentDate()} \n`;
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
            const date = new Date();
            return `${monthNames()[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
        }

        /**
         * Return month names
         *
         * @returns {string[]}
         */
        function monthNames() {
            return [
                'January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'
            ];
        }

        /**
         * Pad 0 if number is less than 10
         *
         * @param n
         * @returns {string}
         */
        function pad(n) {
            return (n < 10) ? ('0' + n) : n;
        }

        /**
         * Set default icon
         */
        function setDefaultIcon() {
            sleep(1000).then(() => chrome.browserAction.setIcon({path: 'icons/standard-16.png'}));
        }

        /**
         * Set success icon
         */
        function setSuccessIcon() {
            chrome.browserAction.setIcon({path: 'icons/check-mark.png'});
            setDefaultIcon();
        }

        /**
         * Set error icon
         */
        function setErrorIcon() {
            chrome.browserAction.setIcon({path: 'icons/cross-mark.png'});
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
