(function() {
  'use strict';

  /**
   * There are 3 types of form in the module:
   *   * The quick form: this is a desktop only view of an edition form for events.
   *   * The full form: this is a desktop and mobile view of an complete edition form for events.
   *   * The consult form: this is a desktop and mobile view of an consult form for events.
   * Note that mobile devices have only access to the full form and the consult form.
   * This service will open the correct form corresponding to the event and the screen size.
   */
  angular.module('esn.calendar')
    .factory('calOpenEventForm', calOpenEventForm);

  function calOpenEventForm($rootScope, $modal, $state, calendarService, calEventUtils, calUIAuthorizationService, matchmedia, notificationFactory, SM_XS_MEDIA_QUERY, CAL_DEFAULT_CALENDAR_ID, CAL_EVENTS) {
    var modalIsOpen = false;

    return function calOpenEventForm(event) {
      calendarService.getCalendar(calendarService.calendarHomeId, event.calendarId || CAL_DEFAULT_CALENDAR_ID).then(function(calendar) {
        if (calUIAuthorizationService.canAccessEventDetails(calendar, event, calendarService.calendarHomeId)) {
          if (!event.isInstance()) {
            _openForm(calendar, event);
          } else {
            _openRecurringModal(event);
          }
        } else {
          notificationFactory.weakInfo('Private event', 'Cannot access private event');
        }
      });
    };

    ////////////

    function _openForm(calendar, event) {
      calEventUtils.setEditedEvent(event);
      if (matchmedia.is(SM_XS_MEDIA_QUERY)) {
        if (calUIAuthorizationService.canModifyEvent(calendar, event, calendarService.calendarHomeId)) {
          $state.go('calendar.event.form', {calendarHomeId: calendarService.calendarHomeId, eventId: event.id});
        } else {
          $state.go('calendar.event.consult', {calendarHomeId: calendarService.calendarHomeId, eventId: event.id});
        }
      } else if (modalIsOpen === false) {
        modalIsOpen = true;
        $modal({
          templateUrl: '/calendar/app/components/open-event-form/event-quick-form-view',
          resolve: {
            event: function(calEventUtils) {
              return calEventUtils.getEditedEvent();
            }
          },
          controller: function($scope, event) {
            var _$hide = $scope.$hide;

            var unregister = $rootScope.$on(CAL_EVENTS.MODAL + '.hide', function() {
              $rootScope.$broadcast(CAL_EVENTS.CALENDAR_UNSELECT);
              $scope.$hide();
            });

            $scope.$hide = function() {
              _$hide.apply(this, arguments);
              modalIsOpen = false;
              unregister && unregister();
            };

            $scope.event = event;
          },
          backdrop: 'static',
          placement: 'center',
          prefixEvent: CAL_EVENTS.MODAL
        });
      }
    }

    function _openRecurringModal(event) {
      $modal({
        templateUrl: '/calendar/app/components/open-event-form/edit-instance-or-series',
        resolve: {
          event: function() {
            return event;
          },
          openForm: function() {
            return _openForm;
          }
        },
        controller: function($scope, event, openForm) {
          $scope.event = event;
          $scope.editAllInstances = function() {
            $scope.$hide();
            event.getModifiedMaster().then(openForm);
          };

          $scope.editInstance = function() {
            $scope.$hide();
            openForm(event);
          };
        },
        openForm: _openForm,
        placement: 'center'
      });
    }
  }
})();