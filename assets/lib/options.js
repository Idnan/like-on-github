/**
 * Options module to manage the options
 * @returns {{init: init}}
 * @constructor
 */
function Options() {

    /**
     * Save value in user local storage
     *
     * @param name
     * @param value
     */
    const save = (name, value) => localStorage.setItem(name, value);

    /**
     * Get value from storage
     *
     * @param value
     * @returns {boolean}
     */
    const get = value => localStorage.getItem(value) ? localStorage.getItem(value) : false;


    const fields = ['token', 'path', 'committer_name', 'committer_email', 'repo', 'owner'],
        quote_item = '.quote-item';

    /**
     * Performs the UI bindings
     */
    let bindUI = function () {

        fields.filter(item => get(item) !== false)
            .forEach(item => document.getElementById(item).value = get(item));

        let save_btn = document.getElementsByClassName('btn-save')[0];

        save_btn.onclick = event => {
            event.preventDefault();

            fields.forEach(item => {
                const value = document.getElementById(item).value.trim();
                if (value.length)
                    save(item, value);
            });

            let heading = document.getElementsByClassName('quote-item')[0];
            heading.innerHTML = 'Woohoo! Setting saved'

            window.scrollTo(0, 0);
        }
    };


    return {
        /**
         * Initializes the options page
         */
        init: () => bindUI()
    };
}

const options = new Options();
options.init();
