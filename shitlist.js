'click .add-new-offender';
Offences = new Meteor.Collection("offences");

if (Meteor.isClient) {
    Template.leaderboard.offences = function () {
        return Offences.find({}, { sort: { severity: -1, offenceDate: -1 } });
    };

    Template.leaderboard.events({
        'click #add-new-offence': function() {
            var offenceId = Offences.insert({
                offender: this.offender.value,
                offenceDate: new Date(),
                severity: 5,
                done: false
            });
            Session.set("selected_offender", offenceId);
            this.offender.value = '';

        }
    });

    Template.offence.selected = function () {
        return Session.equals("selected_offender", this._id);
    };

    Template.offence.events({
        'click .offender': function () {
            Session.set("selected_offender", this._id);
        },
        'click #remove-offence': function () {
            Offences.remove(Session.get('selected_offender'));
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
                offender: 'Joe Bloggs',
                offenceDate: new Date(),
                severity: 1,
                reason: 'twat',
                revenge: 'sign joe\'s work email up to gay porn sites',
                done: false
            });

            Offences.insert({
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
