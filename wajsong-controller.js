/**
 * Created by VadShaytReth on 2014-06-01.
 */

/* Controllers */

(function () {
  BCAPI.Helper.Site.getAccessToken();
  var wajsong_app = angular.module('wajsong-angularapp', []);

  wajsong_app.controller('wajsong_general_controller', function ($scope) {
    $scope.messages = [];
    $scope.foundWebApps = [];

    /*
     *
     * */
    var postMessage = function (msgText) {
      $scope.$apply(function () {
        console.log('MSG: ' + msgText);
        $scope.messages.push(msgText);
      })
    };

    /*
     *
     * */
    var processListOfWebapps = function (webAppItems) {
      webAppItems.each(function (webAppItem) {
        var thisWebappName = webAppItem.get('name'),
            thisWebappID = webAppItem.get('id');

        // Angular doesn't hear scope updates from here, so we use $apply()
        $scope.$apply(function () {
          $scope.foundWebApps.push({
                                     id   : thisWebappID,
                                     name : thisWebappName,
                                     items: []
                                   })
        });

        /*foo*/
        postMessage('Queueing up webapp "' + thisWebappName + '" (id#' + thisWebappID + ') for item download...');
        getItemsFromWebapp(thisWebappID, thisWebappName);
      })
    };

    /*
     *
     * */
    var apps = new BCAPI.Models.WebApp.AppCollection();
    apps.fetch({
                 success: processListOfWebapps,
                 error  : function (webAppItems, xhr) {
                   // handle errors
                   console.warn('Error retreiving web app collection');
                 }
               });

    /*
     *
     * */
    var getItemsFromWebapp = function (webappid, webappname) {

      var webappScopeIndex = undefined;

      _.each(
        $scope.foundWebApps,
        function (webapp, index) {
          /*console.log(webapp);*/
          if (webapp.id === webappid) {
            webappScopeIndex = index;
          }
        }
      );

      /*console.log('webappscopeindex result:');*/
      /*console.log(webappScopeIndex);*/
      /*console.log($scope.foundWebApps[webappScopeIndex]);*/
      $scope.foundWebApps[webappScopeIndex].items = [];

      var itemCollection = new BCAPI.Models.WebApp.ItemCollection(webappname);
      itemCollection.fetch({
                             // TODO: fetch ALL the items
                             skip   : 0,
                             limit  : 100000,
                             success: function (items) {
                               /*console.log('Items loaded successfully, here are the details:');*/

                               var itemsToFetch = 0;

                               var oneLessFetchRemaining = function () {
                                 itemsToFetch--;
                                 if (itemsToFetch < 1) {
                                   // No more items to fetch; we're ready to work on a complete set.
                                   $scope.$apply(function () {
                                     /*console.log('Finished fetching webapp "' + webappname + '" items');*/

                                     writeJSONfile(webappid, webappname, webappScopeIndex);
                                   })
                                 }
                               };

                               // TODO: check for empty set of items

                               items.each(function (item) {
                                 itemsToFetch++;
                                 item.fetch({
                                              where  : {'name': '*'},
                                              success: function (itemDetails) {
                                                /*console.log(itemDetails.attributes);*/
                                                $scope.foundWebApps[webappScopeIndex].items.push(itemDetails.attributes);
                                                oneLessFetchRemaining();
                                              }
                                              // TODO: catch failure
                                            });
                               });
                             },
                             error  : function (jqXHR) {
                               console.warn("Request failed.");
                             }
                           });

      /*
       *
       * */
      var writeJSONfile = function (webAppId, webAppName, webAppScopeIndex) {
        /*var targetFileName =  '/_System/bosweb-wajsong/by-id/' + webAppId + '.json';*/
        var targetFileName = webAppId + '.json';
        // TODO: find why WebStorm is expecting three args for this function...
        var targetFile = BCAPI.Models.FileSystem.Root.file(targetFileName);
        targetFile.upload(
          JSON.stringify($scope.foundWebApps[webAppScopeIndex])
        ).done(function () {
                 postMessage('Wrote some json to ' + targetFileName)
               })
      }
    };
  });
})();