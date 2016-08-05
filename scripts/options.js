/**
 * Options module to manage the options
 * @returns {{init: init}}
 * @constructor
 */
function Options() {

    var fields = ["token", "path", "email", "repo", "owner"],
        quote_item = ".quote-item";

    /**
     * Performs the UI bindings
     */
    var bindUI = function () {

        // set value of fields
        $.each(fields, function (key, item) {
            if (get(item) !== false) {
                $('#' + item).val(get(item));
            }
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
        });
    };

    /**
     * Save value in user local storage
     *
     * @param name
     * @param val
     */
    var save = function (name, val) {
        localStorage.setItem(name, val);
    };

    /**
     * Get value from storage
     *
     * @param val
     * @returns {boolean}
     */
    var get = function (val) {
        if (localStorage.getItem(val)) {
            return localStorage.getItem(val);
        }
        return false;
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