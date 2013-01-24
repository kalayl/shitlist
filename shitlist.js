Offences = new Meteor.Collection("offences");
Shitlists = new Meteor.Collection("shitlists");

if (Meteor.isClient) {
    var Router = Backbone.Router.extend({
        routes: {
            "" : "main",
            ":page": "main" //this will be http://your_domain/
        },
        main: function (page) {
            document.body.innerHTML = "";
            page = page ? "shitlist" : "index";

            var frag = Meteor.render(function () {
                var i = Template[page] ? Template[page]() : "";
                return i;
            });

            document.body.appendChild(frag);
        }
    });

    var app = new Router;

    Meteor.startup(function () {
        Backbone.history.start({pushState: true});
    });

    Template.index.shitlists = function () {
        return Shitlists.find({}, { sort: { creationDate: -1 }});
    };

    Template.shitlistItem.listUri = function () {
        return window.location + this.name;
    };

    Template.index.events({
        'keypress #newShitlist': function (event, template) {
            if (event.keyCode === 13) {
                var newShitlistName = this.newShitlist.value;
                window.location.replace(window.location + newShitlistName);
            }
        }
    });

    var checkAndCreateNewShitlist = function (newShitlistName) {
        var list = Shitlists.findOne({ name: newShitlistName });
        console.log(newShitlistName + " = " + list);
        if (list === undefined) {
            console.log('creating a new list ' + newShitlistName);
            Shitlists.insert({
                name: newShitlistName,
                creationDate: new Date()
            });
        }
    };

    Template.shitlist.shitlistUri = function () {
        return window.location.pathname.substr(1);
    };

    Template.shitlist.created = function () {
        var shitlist = window.location.pathname.substr(1);
        checkAndCreateNewShitlist(shitlist);
    };

    Template.shitlist.offences = function () {
        var shitlist = window.location.pathname.substr(1);
        if (shitlist.length) {
            return Offences.find({shitlist: shitlist}, { sort: { severity: -1, offenceDate: -1 } });
        }
    };

    Template.shitlist.events({
        'keypress #offender': function (event, template) {
            if (event.keyCode === 13) {
                var shitlist = window.location.pathname.substr(1);
                var offenceId = Offences.insert({
                    shitlist: shitlist,
                    reason: 'your reason',
                    revenge: 'your revenge',
                    offender: this.offender.value,
                    offenceDate: new Date(),
                    severity: 5,
                    done: false
                });
                //Session.set("selected_offender", offenceId);
                this.offender.value = '';
            }
        }
    });

    //Template.offence.selected = function () {
    //    return Session.equals("selected_offender", this._id);
    //};

    Template.offence.offenceHandled = function () {
        return this.done ? "checked" : "";
    }

    Template.offence.hasOffenceDate = function () {
        return this.offenceDate;
    }

    Template.offence.formattedOffenceDate = function () {
        return (this.offenceDate ? new Date(this.offenceDate).toDateString() : "");
    };

    Template.offence.events({
        'click .readonly': function (event, template) {
            startEdit(template, readOnlyFieldName(event));
        },
        'blur .editable': function (event, template) {
            endEdit(template, editableFieldName(event));
        },

        'click #remove-offence': function (event, template) {
            Offences.remove(template.data._id);
        },
        'click #decrease-severity': function (event, template) {
            Offences.update({ _id: template.data._id, severity: { $gt: 1} }, { $inc: { severity: -1 }}, { multi: false });
        },
        'click #increase-severity': function (event, template) {
            Offences.update({ _id: template.data._id, severity: { $lt: 5} }, { $inc: { severity: 1 }}, { multi: false });
        },
        'click #offender-handled': function (event, template) {
            Offences.update({ _id: template.data._id}, { $set: { done: !template.data.done } }, { multi: false });
        }
    });

    var startEdit = function (template, field) {
        console.log('startedit');

        var editableField = template.find('.' + field + '-editable');
        var readonlyField = template.find('.' + field + '-readonly');
        console.log(editableField);
        console.log(readonlyField);

        $(readonlyField).addClass('hidden');
        $(editableField).removeClass('hidden');
        $(editableField).focus().val(template.data[field]);
    };

    var endEdit = function (template, field) {
        console.log('endedit ');

        var editableField = template.find('.' + field + '-editable');
        var readonlyField = template.find('.' + field + '-readonly');

        var newValue = editableField.value;
        var setModifier = { $set : {} };
        setModifier.$set[field] = newValue;

        Offences.update({ _id : template.data._id}, setModifier);
        $(editableField).addClass('hidden');
        $(readonlyField).removeClass('hidden');
    };

    var readOnlyFieldName = function (event) {
        return findPrefixInClassName(event, '-readonly');
    };

    var editableFieldName = function (event) {
        return findPrefixInClassName(event, '-editable');
    };

    var findPrefixInClassName = function (event, value) {
        var classList = $(event.srcElement).attr('class').split(/\s+/);
        var result = "";
        $.each(classList, function (index, item, cb) {
            var index = item.indexOf(value);
            if (index > -1) {
                result = item.substr(0, index);
            }
        });
        return result;
    };
}

if (Meteor.isServer) {
    Meteor.startup(function () {
        if (Offences.find().count() === 0) {
            Shitlists.insert({
                name: '123',
                creationDate: new Date()
            });

            Offences.insert({
                shitlist: '123',
                offender: 'Joe Bloggs',
                offenceDate: new Date(),
                severity: 1,
                reason: 'twat',
                revenge: 'sign joe\'s work email up to gay porn sites',
                done: false
            });

            Offences.insert({
                shitlist: '123',
                offender: 'Mary Jane',
                offenceDate: new Date(),
                severity: 5,
                reason: 'silly',
                revenge: 'postit notes all over her workstation',
                done: false
            });
        }
    });
}
