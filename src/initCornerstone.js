import dicomParser from 'dicom-parser';
import cornerstone from 'cornerstone-core';
import cornerstoneWADOImageLoader from '../dist/static/cornerstoneWADOImageLoader';
import cornerstoneMath from 'cornerstone-math';
import cornerstoneTools from 'cornerstone-tools';
import Hammer from 'hammerjs';

export default function initCornerstone() {
  // Cornertone Tools
  cornerstoneTools.external.cornerstone = cornerstone;
  cornerstoneTools.external.Hammer = Hammer;
  cornerstoneTools.external.cornerstoneMath = cornerstoneMath;

  //
  cornerstoneTools.init();

  // Preferences
  const fontFamily =
    'Work Sans, Roboto, OpenSans, HelveticaNeue-Light, Helvetica Neue Light, Helvetica Neue, Helvetica, Arial, Lucida Grande, sans-serif';
  cornerstoneTools.textStyle.setFont(`16px ${fontFamily}`);
  cornerstoneTools.toolStyle.setToolWidth(2);
  cornerstoneTools.toolColors.setToolColor('rgb(255, 255, 0)');
  cornerstoneTools.toolColors.setActiveColor('rgb(0, 255, 0)');

  cornerstoneTools.store.state.touchProximity = 40;

  // IMAGE LOADER
  cornerstoneWADOImageLoader.external.cornerstone = cornerstone
  cornerstoneTools.external.Hammer = Hammer
  
  cornerstoneWADOImageLoader.external.dicomParser = dicomParser
  var config = {
    maxWebWorkers: navigator.hardwareConcurrency || 1,
    startWebWorkersOnDemand : true,
  };
  cornerstoneWADOImageLoader.webWorkerManager.initialize(config)

  // Debug
  window.cornerstone = cornerstone;
  window.cornerstoneTools = cornerstoneTools;
}
