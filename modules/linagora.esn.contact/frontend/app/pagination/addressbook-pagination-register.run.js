(function(angular) {
  'use strict';

  angular.module('linagora.esn.contact')
    .run(registerAddressbookPaginationModes);

  function registerAddressbookPaginationModes(
    AddressBookPaginationRegistry,
    AddressBookPaginationProvider,
    SearchAddressBookPaginationProvider,
    MultipleAddressBookPaginationProvider,
    CONTACT_LIST_DISPLAY_MODES
  ) {
    AddressBookPaginationRegistry.put(CONTACT_LIST_DISPLAY_MODES.single, AddressBookPaginationProvider);
    AddressBookPaginationRegistry.put(CONTACT_LIST_DISPLAY_MODES.search, SearchAddressBookPaginationProvider);
    AddressBookPaginationRegistry.put(CONTACT_LIST_DISPLAY_MODES.multiple, MultipleAddressBookPaginationProvider);
  }
})(angular);
