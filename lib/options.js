/**
 * Created by LuJian on 2016/7/5.
 */


module.exports = {
    defaultOptions: function(options){
        function getDefaultOptions(){
            return {
                file: [],
                directory: [],
                layout: 'flat' // flat hierarchy

            };
        }
        return options || getDefaultOptions();
    }
}