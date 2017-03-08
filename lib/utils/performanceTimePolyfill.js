// @license http://opensource.org/licenses/MIT
// copyright Paul Irish 2015


// Date.now() is supported everywhere except IE8. For IE8 we use the Date.now polyfill
//   github.com/Financial-Times/polyfill-service/blob/master/polyfills/Date.now/polyfill.js
// as Safari 6 doesn't have support for NavigationTiming, we use a Date.now() timestamp for relative values

// if you want values similar to what you'd get with real perf.now, place this towards the head of the page
// but in reality, you're just getting the delta between now() calls, so it's not terribly important where it's placed

module.exports = () => {

  if ("performance" in global === false) {
      global.performance = {};
  }

  Date.now = (Date.now || (() => // thanks IE8
  new Date().getTime()));

  if ("now" in global.performance === false){

    let nowOffset = Date.now();

    if (performance.timing && performance.timing.navigationStart){
      nowOffset = performance.timing.navigationStart;
    }

    global.performance.now = function now(){
      return Date.now() - nowOffset;
    };
  }
};
