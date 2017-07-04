/**
 * Options module to manage the options
 * @returns {{init: init}}
 * @constructor
 */
function Options() {

    var fields = ["token", "path", "committer_name", "committer_email", "repo", "owner"],
        quote_item = ".quote-item";

    /**
     * Performs the UI bindings
     */
    var bindUI = function () {

        // set value of fields
        $.each(fields, function (key, item) {
            chrome.storage.sync.get(item, function (o) {
                if (o[item]) {
                    $('#' + item).val(o[item]);
                }
            });
        });

        $(document).on('click', '.btn-save', function (e) {
            e.preventDefault();

            $.each(fields, function (key, item) {
                var value = $('#' + item).val().trim();
                if (value) {
                    save(item, value);
                }
            });

            $(quote_item).html('Woohoo! Setting saved.');
            window.scrollTo(0, 0);
        });
    };

    /**
     * Save value in user local storage
     *
     * @param name
     * @param val
     */
    var save = function (name, val) {
        chrome.storage.sync.set({[name]: val});
    };

    return {

        /**
         * Initializes the options page
         */
        init: function () {
            bindUI();
        }
    };
}

$(function () {
    var options = new Options();
    options.init();
});