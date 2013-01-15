Offences = new Meteor.Collection("offences");

if (Meteor.isClient) {
    Template.leaderboard.shitlist = function () {
        return this.window.location.pathname.substr(1);
    };

    Template.leaderboard.offences = function () {
        var shitlist = this.window.location.pathname.substr(1);
        return Offences.find({shitlist: shitlist}, { sort: { severity: -1, offenceDate: -1 } });
    };

    Template.leaderboard.events({
        'keypress #offender': function (event, template) {
            if (event.keyCode === 13) {
                var shitlist = this.window.location.pathname.substr(1);
                var offenceId = Offences.insert({
                    shitlist: shitlist,
                    offender: this.offender.value,
                    offenceDate: new Date(),
                    severity: 5,
                    done: false
                });
                Session.set("selected_offender", offenceId);
                this.offender.value = '';
            }
        }//,
//        'click #add-new-offence': function() {
//        }
    });

    Template.offence.selected = function () {
        return Session.equals("selected_offender", this._id);
    };

    Template.offence.hasOffenceDate = function () {
        return this.offenceDate;
    }

    Template.offence.formattedOffenceDate = function () {
        return (this.offenceDate ? new Date(this.offenceDate).toDateString() : "");
    };

    Template.offence.events({
        'click .offender': function (event, template) {
            Session.set("selected_offender", this._id);
        },
        'click #remove-offence': function (event, template) {
            Offences.remove(template.data._id);
        },
        'click #decrease-severity': function (event, template) {
            Offences.update({ _id: template.data._id, severity: { $gt: 1} }, { $inc: { severity: -1 }}, { multi: false })
        },
        'click #increase-severity': function (event, template) {
            Offences.update({ _id: template.data._id, severity: { $lt: 5} }, { $inc: { severity: 1 }}, { multi: false })
        }
    });
}

if (Meteor.isServer) {
    Meteor.startup(function () {
        if (Offences.find().count() === 0) {
            Offences.insert({
                shitlist: "123",
                offender: 'Joe Bloggs',
                offenceDate: new Date(),
                severity: 1,
                reason: 'twat',
                revenge: 'sign joe\'s work email up to gay porn sites',
                done: false
            });

            Offences.insert({
                shitlist: "123",
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
