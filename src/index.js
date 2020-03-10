import React from "react"
import { render } from "react-dom"
import * as cornerstone from "cornerstone-core"
import * as cornerstoneMath from "cornerstone-math"
import * as cornerstoneTools from "cornerstone-tools"
import * as dicomParser from "dicom-parser"
import Hammer from "hammerjs"
import './index.css'
import cornerstoneWADOImageLoader from '../dist/static/cornerstoneWADOImageLoader'

cornerstoneTools.external.cornerstone = cornerstone
cornerstoneTools.external.cornerstoneMath = cornerstoneMath
// cornerstoneWebImageLoader.external.cornerstone = cornerstone
cornerstoneWADOImageLoader.external.cornerstone = cornerstone
cornerstoneTools.external.Hammer = Hammer
cornerstoneWADOImageLoader.external.dicomParser = dicomParser

var config = {
  maxWebWorkers: navigator.hardwareConcurrency || 1,
  startWebWorkersOnDemand : true,
  taskConfiguration: {
    'decodeTask': {
			initializeCodecsOnStartup: false,
			usePDFJS: false
		},
  }
};
cornerstoneWADOImageLoader.webWorkerManager.initialize(config)

const divStyle = {
  width: "512px",
  height: "512px",
  position: "relative",
  color: "white"
};

const bottomLeftStyle = {
  bottom: "5px",
  left: "5px",
  position: "absolute",
  color: "white"
};

const bottomRightStyle = {
  bottom: "5px",
  right: "5px",
  position: "absolute",
  color: "white"
};

class CornerstoneElement extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      stack: props.stack,
      viewport: cornerstone.getDefaultViewport(null, undefined),
      imageId: props.stack.imageIds[0],
      scrollTop:0
    };

    this.onImageRendered = this.onImageRendered.bind(this);
    this.onNewImage = this.onNewImage.bind(this);
    this.onWindowResize = this.onWindowResize.bind(this);
  }

  onWindowResize() {
    console.log("onWindowResize");
    cornerstone.resize(this.element);
  }

  onImageRendered() {
    const viewport = cornerstone.getViewport(this.element);
    console.log('ppppppp', viewport);

    this.setState({
      viewport
    });

    console.log('=========', this.state.viewport);
  }

  onNewImage() {
    const enabledElement = cornerstone.getEnabledElement(this.element);

    this.setState({
      imageId: enabledElement.image.imageId
    });
  }

  componentDidMount() {
    const element = this.element;

    // Enable the DOM Element for use with Cornerstone
    cornerstone.enable(element)
    /** png jpeg格式 */
    /** Load the first image in the stack
    cornerstone.loadImage(this.state.imageId).then(image => {
      console.log('iiiiiiiiiiii', image)
      Display the first image
      cornerstone.displayImage(element, image);

      Add the stack tool state to the enabled element
      const stack = this.props.stack;
      cornerstoneTools.addStackStateManager(element, ["stack"]);
      cornerstoneTools.addToolState(element, "stack", stack);

      cornerstoneTools.mouseInput.enable(element);
      cornerstoneTools.mouseWheelInput.enable(element);
      cornerstoneTools.wwwc.activate(element, 1); // ww/wc is the default tool for left mouse button
      cornerstoneTools.pan.activate(element, 2); // pan is the default tool for middle mouse button
      cornerstoneTools.zoom.activate(element, 4); // zoom is the default tool for right mouse button
      cornerstoneTools.zoomWheel.activate(element); // zoom is the default tool for middle mouse wheel

      cornerstoneTools.touchInput.enable(element);
      cornerstoneTools.panTouchDrag.activate(element);
      cornerstoneTools.zoomTouchPinch.activate(element);

      element.addEventListener(
        "cornerstoneimagerendered",
        this.onImageRendered
      );
      element.addEventListener("cornerstonenewimage", this.onNewImage);
      window.addEventListener("resize", this.onWindowResize);
    }).catch((e) => {
      console.log('%%%%%', e)
    }) **/
    /** dicom格式 */
    cornerstone.loadAndCacheImage(`wadouri:${this.state.imageId}`)
      .then(function (image) {
        var viewport = cornerstone.getDefaultViewportForImage(element, image)
        cornerstone.displayImage(element, image, viewport);
      }, function (err) {
        console.log(err);
      })
    const _this = this
    let lastI = 0
    // this.wraper.addEventListener('scroll', function (ev) {
    //   if (this.scrollTop % 20) {
    //     const x = this.clientHeight / 5
    //   // console.log('eeee', this.scrollTop, this.clientHeight)
    //   console.log('gggggggg',this.scrollTop, x,  (this.scrollTop / x), Math.floor(this.scrollTop / x))
    //   let i = Math.floor(this.scrollTop / x)
    //   if (i < 0) {
    //     i = 0
    //   } else if (i > 4) {
    //     i = 4
    //   }
    //   if (lastI !== i) {
    //     console.log('iiiiiiiiiiiii', i)
    //     _this.setState({
    //       imageId: _this.props.stack.imageIds[i],
    //       scrollTop: this.scrollTop
    //     })
    //     lastI = i
    //   }
    //   }
    // })
    this.pastDiff = 0
    this.slidebtn.onmousedown = function (ev) {
      let startY = ev.clientY
      let n = 0
      let diffY = _this.pastDiff
      let max =  _this.wraper.clientHeight - this.clientHeight
      window.onmousemove = this.onmousemove = (ev) => {
        n++
        if (n % 4 === 0) {
          let moveY = ev.clientY
          diffY = _this.pastDiff +  (moveY - startY)
          if (diffY < 0) {
            diffY = 0
          } else if (diffY > max) {
            diffY = max
          }
          const baseNum = Math.floor(max / 20)
          const n = Math.floor(diffY / baseNum)
          console.log('n', n)
          if (lastI !== n) {
            _this.setState({
              imageId: `/images/0000${n > 19 ? 19 : n.toString().padStart(2, '0')}.dcm`
            })
            lastI = n
          }
          this.style.transform = `translateY(${diffY}px)`
        }
      }
      window.onmouseup = this.onmouseup = () => {
        _this.pastDiff = diffY
        window.onmousemove = this.onmousemove = null
        window.onmouseup = this.onmouseup = null
      }
    }
    // var w = new Worker("./webWorder.js")
  }

  componentWillUnmount() {
    // const element = this.element;
    // element.removeEventListener(
    //   "cornerstoneimagerendered",
    //   this.onImageRendered
    // );

    // element.removeEventListener("cornerstonenewimage", this.onNewImage);

    // window.removeEventListener("resize", this.onWindowResize);

    // cornerstone.disable(element);
  }

  componentDidUpdate(prevProps, prevState) {
    // const stackData = cornerstoneTools.getToolState(this.element, "stack");
    // const stack = stackData.data[0];
    // stack.currentImageIdIndex = this.state.stack.currentImageIdIndex;
    // stack.imageIds = this.state.stack.imageIds;
    // cornerstoneTools.addToolState(this.element, "stack", stack);

    //const imageId = stack.imageIds[stack.currentImageIdIndex];
    //cornerstoneTools.scrollToIndex(this.element, stack.currentImageIdIndex);
    console.log('ooooooooooooooooooooooo')
    if (prevState.imageId !== this.state.imageId) {
      const element = this.element;
      cornerstone.enable(element)
      cornerstone.loadAndCacheImage(`wadouri:${this.state.imageId}`)
      .then( (image) => {
        console.log('&&&&&&&&&&&&', this.state.imageId)
        var viewport = cornerstone.getDefaultViewportForImage(element, image);
        cornerstone.displayImage(element, image, viewport);
      }, function (err) {
        console.log(err);
      })
    }
    

  }
  render() {
    return (
      <div
        style={{position: 'relative', height: '512px'}}
        ref={input => {
          this.wraper = input
        }}  
      >
        <div className='slide'>
          <div
            ref={input => this.slidebtn = input}
            className='slidebtn'
          ></div>
        </div>
        <div style={{position: 'absolute'}}>loading....</div>
        <div
          className="viewportElement"
          style={{...divStyle, position: 'absolute'}}
          ref={input => {
            this.element = input;
          }}
        >
          <canvas className="cornerstone-canvas" />
          <div style={bottomLeftStyle}>Zoom: {this.state.viewport.scale}</div>
          <div style={bottomRightStyle}>
            WW/WC: {this.state.viewport.voi.windowWidth} /{" "}
            {this.state.viewport.voi.windowCenter}
          </div>
        </div>
      </div>
    );
  }
}

const stack = {
  imageIds: [
    "/images/000000.dcm"
  ],
  currentImageIdIndex: 0
};

const App = () => (
  <div>
    <h2>React with Cornerstone demo -- show dicom in web</h2>
    <CornerstoneElement stack={{ ...stack }} />
  </div>
);

render(<App />, document.getElementById("root"));

// import React from 'react';
// import ReactDOM from 'react-dom';

// import './index.css';
// import App from './App';
// import initCornerstone from './initCornerstone.js';

// initCornerstone();
// ReactDOM.render(<App />, document.getElementById('root'));
