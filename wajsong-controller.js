/**
 * Created by VadShaytReth on 2014-06-01.
 */

/* Controllers */

(function () {
  BCAPI.Helper.Site.getAccessToken();
  var itemsFetchedAtOnce = 100;
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
                   console.group();
                   console.warn('Error retreiving web app collection. xhr object follows.');
                   console.log(xhr);
                   console.groupEnd();
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

      /*
      * Called by the fetch() on an itemCollection.
      *
      * */
      var fetchSubsetofItems = function (items) {

        if (itemCollection.length < 1) {
          postMessage('No items to fetch from app "' + webappname + '"');
          console.log(itemCollection)
        } else {
          /*console.log('Items loaded successfully, here are the details:');*/
          var itemsToFetch = 0;

          var oneLessFetchRemaining = function () {
            itemsToFetch--;
            if (itemsToFetch < 1) {
              // No more items to fetch in this subset; we're ready to grab the next subset.

              // TODO: grab next subset?
            }
          };

          items.each(function (item) {
            itemsToFetch++;
            item.fetch({
                         success: function (itemDetails) {
                           /*console.log(itemDetails.attributes);*/
                           $scope.foundWebApps[webappScopeIndex].items.push(itemDetails.attributes);
                           oneLessFetchRemaining();
                         },
                         // TODO: catch failure
                         error  : function () {
                           console.error('Failure... ')
                         }
                       });

          });

          // TODO: fetch the next bunch of items
          // ...
          offset += itemsFetchedAtOnce;
          postMessage('About to fetch another bunch, at offset ' + offset);
          itemCollection.fetch({
                                 // TODO: fetch ALL the items
                                 skip   : offset,
                                 limit  : itemsFetchedAtOnce,
                                 success: fetchSubsetofItems,
                                 error  : function (jqXHR) {
                                   console.group();
                                   console.warn("Request failed. jqXHR object follows.");
                                   console.log(jqXHR);
                                   console.groupEnd();
                                 }
                               });
        }
      };

      var itemCollection = new BCAPI.Models.WebApp.ItemCollection(webappname);
      var offset = 0;
      itemCollection.fetch({
                             // TODO: fetch ALL the items
                             skip   : 0,
                             limit  : 100,
                             success: fetchSubsetofItems,
                             error  : function (jqXHR) {
                               console.group();
                               console.warn("Request failed. jqXHR object follows.");
                               console.log(jqXHR);
                               console.groupEnd();
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