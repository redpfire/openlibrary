/**
 * jquery repeat: jquery plugin to handle repetitive inputs in a form.
 *
 * Used in addbook process.
 */
(function($){
    // For v2 and v1 page support. Can be removed when no v1 support needed
    var isOldJQuery = $( 'body' ).on === undefined;
    $.fn.repeat = function(options) {
        var addSelector, removeSelector;
        options = options || {};

        var id = "#" + this.attr("id");
        var elems = {
            '_this': this,
            'add': $(id + '-add'),
            'form': $(id + '-form'),
            'display': $(id + '-display'),
            'template': $(id + '-template')
        }
        
        function createTemplate(selector) {
            var code = $(selector).html()
                            .replace(/%7B%7B/gi, "<%=")
                            .replace(/%7D%7D/gi, "%>")
                            .replace(/{{/g, "<%=")
                            .replace(/}}/g, "%>");
            // Template is defined in openlibrary\plugins\openlibrary\js\template.js
            // eslint-disable-next-line no-undef
            return Template(code);
        }
        
        var t = createTemplate(id + "-template");
        
        function formdata() {
            var data = {};
            $(":input", elems.form).each(function() {
                var e = $(this);
                data[e.attr("name")] = $.trim(e.val());
            });
            return data;
        }
        function onAdd(event) {
            console.log('add');
            event.preventDefault();
            
            var index = elems.display.children().length;
            var data = formdata();
            data.index = index;
            
            if (options.validate && options.validate(data) == false) {
                return;
            }
            
            $.extend(data, options.vars || {});
            
            var newid = elems._this.attr("id") + "--" + index;
            elems.template
                .clone()
                .attr("id", newid)
                .html(t(data))
                .show()
                .appendTo(elems.display);
                
            $("input[type!=button], textarea", elems.form).filter(":not(.repeat-ignore)").val("");
            elems._this.trigger("repeat-add");
        }
        function onRemove(event) {
            event.preventDefault();
            $(this).parents(".repeat-item:eq(0)").remove();
            elems._this.trigger("repeat-remove");
        }
        addSelector = id + " .repeat-add";
        removeSelector = id + " .repeat-remove";
        // Click handlers should apply to newly created add/remove selectors
        if ( isOldJQuery ) {
            $(addSelector).live("click", onAdd);
            $(removeSelector).live("click", onRemove);
        } else {
            $(document).on("click", addSelector, onAdd);
            $(document).on("click", removeSelector, onRemove);
        }
    }
})(jQuery);
