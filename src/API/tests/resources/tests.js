module( "Tooling" );

$.Oda.Event.addListener({name : "oda-fully-loaded", callback : function(e){
    test( "$.Oda.Tooling.arrondir", function() {
        equal($.Oda.Tooling.arrondir(10.42, 1), 10.4, "Test OK : Passed!" );
    });
    test( "$.Oda.Tooling.clearSlashes", function() {
        equal($.Oda.Tooling.clearSlashes("Hello/"), "Hello", "Test OK : Passed!" );
    });
    test( "$.Oda.Tooling.clone", function() {
        var obj = {attr1 : "value1", attr2 : "value2"};
        var obj2 = $.Oda.Tooling.clone(obj);
        deepEqual(obj2, {attr1 : "value1", attr2 : "value2"}, "Test OK : Passed!" );
    });
}});