/*
* html5tooltips
* 2016-05-08
* (c) Eugene Tiurin; MIT license
*
* Tooltips with smooth 3D animation.
*
* Contributors: nomiad, Friedel Ziegelmayer, Arend van Beelen jr.,
* Peter Richmond, Bruno Wego, Kahmali Rose
*/

// UNIVERSAL MODULE DEFINITION
(function (root, factory) {
  'use strict';

    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory();
    } else {
        // Define global constructor
        root.html5tooltips = factory();
    }

// HTML5TOOLTIPS MODULE
}(this, function () {
  'use strict';

  var

  tooltipHTML='\
<div class="html5tooltip" style="box-sizing:border-box;position:fixed;z-index: 1000001;">\
  <div class="html5tooltip-box" box>\
    <div class="html5tooltip-text" text></div>\
      <div class="html5tooltip-more" style="overflow:hidden;" more>\
        <div class="html5tooltip-text" more-text></div>\
      </div>\
    </div>\
</div>\
',

  html5tooltipsPredefined = {
    animateFunction: {
      fadeIn: "fadein",
      foldIn: "foldin",
      foldOut: "foldout",
      roll: "roll",
      scaleIn: "scalein",
      slideIn: "slidein",
      spin: "spin"
    },

    color: {
      "daffodil": {r: 255, g: 230, b: 23},
      "daisy": {r: 250, g: 211, b: 28},
      "mustard": {r: 253, g: 183, b: 23},
      "citrus zest": {r: 250, g: 170, b: 33},
      "pumpkin": {r: 241, g: 117, b: 63},
      "tangerine": {r: 237, g: 87, b: 36},
      "salmon": {r: 240, g: 70, b: 57},
      "persimmon": {r: 234, g: 40, b: 48},
      "rouge": {r: 188, g: 35, b: 38},
      "scarlet": {r: 140, g: 12, b: 3},
      "hot pink": {r: 229, g: 24, b: 93},
      "princess": {r: 243, g: 132, b: 174},
      "petal": {r: 250, g: 198, b: 210},
      "lilac": {r: 178, g: 150, b: 199},
      "lavender": {r: 123, g: 103, b: 174},
      "violet": {r: 95, g: 53, b: 119},
      "cloud": {r: 195, g: 222, b: 241},
      "dream": {r: 85, g: 190, b: 237},
      "gulf": {r: 49, g: 168, b: 224},
      "turquoise": {r: 35, g: 138, b: 204},
      "sky": {r: 13, g: 96, b: 174},
      "indigo": {r: 20, g: 59, b: 134},
      "navy": {r: 0, g: 27, b: 74},
      "sea foam": {r: 125, g: 205, b: 194},
      "teal": {r: 0, g: 168, b: 168},
      "peacock": {r: 18, g: 149, b: 159},
      "ceadon": {r: 193, g: 209, b: 138},
      "olive": {r: 121, g: 145, b: 85},
      "bamboo": {r: 128, g: 188, b: 66},
      "grass": {r: 74, g: 160, b: 63},
      "kelly": {r: 22, g: 136, b: 74},
      "forrest": {r: 0, g: 63, b: 46},
      "chocolate": {r: 56, g: 30, b: 17},
      "terra cotta": {r: 192, g: 92, b: 32},
      "camel": {r: 191, g: 155, b: 107},
      "linen": {r: 233, g: 212, b: 167},
      "stone": {r: 231, g: 230, b: 225},
      "smoke": {r: 207, g: 208, b: 210},
      "steel": {r: 138, g: 139, b: 143},
      "slate": {r: 119, g: 133, b: 144},
      "charcoal": {r: 71, g: 77, b: 77},
      "black": {r: 5, g: 6, b: 8},
      "white": {r: 255, g: 255, b: 255},
      "metalic silver": {r: 152, g: 162, b: 171},
      "metalic gold": {r: 159, g: 135, b: 89},
      "metalic copper": {r: 140, g: 102, b: 65}
    },

    stickTo: {
      bottom: "bottom",
      left: "left",
      right: "right",
      top: "top"
    }
  },

  defaultOptions = {
    animateDuration: 300,
    animateFunction: html5tooltipsPredefined.animateFunction.fadeIn,
    delay: 500,
    disableAnimation: false,
    stickTo: html5tooltipsPredefined.stickTo.bottom,
    stickDistance: 10
  };

  // UI COMPONENT CONSTRUCTOR
  function UIComponent(publicInterface,HTML)
  {
    function argsToObj(args)
    {
      var argTypes=toArray(args).map(function(a){return typeof a});
      var obj={};

      if(argTypes[0]==='object')
        obj=args[0];

      else if(argTypes[0]==='string'){
        var keys=args[0].split(' ');
        for(var i in keys)
          obj[keys[i]]=args[1];
      }

      else if(argTypes[0]==='function')
        obj={'':args[0]};

      return obj;
    }

    function gainAnchorElements(elements,anchors)
    {
      var attrName;

      for(var i=0;i<elements.length;i++){
        for(var j=0;j<elements[i].attributes.length;j++){
          attrName=elements[i].attributes.item(j).name
            //dashToCamel
            .replace(/-([a-z])/g,function(g){return g[1].toUpperCase()});

          anchors[attrName]=anchors[attrName]||[];
          anchors[attrName].push(elements[i]);
        }

        gainAnchorElements(elements[i].children,anchors)
      }
    }

    function notifyObservers(propName)
    {
      clearTimeout(notifyTimeoutID[propName]);
      notifyTimeoutID[propName]=setTimeout(function(){
        for(var i in modelObservers[propName])
          modelObservers[propName][i](model[propName]);

        if(modelObservers[''])
          for(var i in modelObservers[''])
            modelObservers[''][i]();
      });
    }

    function toArray(obj,fromIndex)
    {
      return Array.prototype.slice.call(obj,fromIndex);
    }

    var

    anchors=[],
    component={},
    elements=[],
    eventCallbacks={},
    modelObservers={},
    model={},
    notifyTimeoutID={};

    if(HTML){
      var p=document.createElement('div');
      p.innerHTML=HTML;
      elements=toArray(p.children);
      gainAnchorElements(elements,anchors);
    }

    // COMPONENT PROPERTIES
    component.anchors=anchors;
    component.components=publicInterface.components={};
    component.elements=publicInterface.elements=elements;
    component.model=publicInterface.model=model;

    // COMPONENT INTERFACE
    component.assignModel=publicInterface.assignModel=function(userModel){
      component.model=publicInterface.model=model=userModel;

      for(var propName in model)
        notifyObservers(propName);
    };

    component.destroy=publicInterface.destroy=function(){
      for(var key in component.components)
        component.components[key].destroy&&component.components[key].destroy();

      for(var i=elements.length;i--;)
        elements[i].parentNode&&
          elements[i].parentNode.removeChild(elements[i]);
    };

    component.dispatch=function(eventName){
      var args=toArray(arguments,1);

      setTimeout(function(){
        for(var i in eventCallbacks[eventName])
          eventCallbacks[eventName][i].apply(publicInterface,args);
      });
    };

    component.on=publicInterface.on=function(){
      var userEventCallbacks=argsToObj(arguments);

      for(var eventName in userEventCallbacks){
        eventCallbacks[eventName]=eventCallbacks[eventName]||[];
        eventCallbacks[eventName].push(userEventCallbacks[eventName]);
      }
    };

    component.onModelUpdate=function(){
      var updateCallbacks=argsToObj(arguments);

      for(var propName in updateCallbacks){
        model[propName]=model[propName]||null;
        modelObservers[propName]=modelObservers[propName]||[];
        modelObservers[propName].push(updateCallbacks[propName]);
        notifyObservers(propName);
      }
    };

    component.set=publicInterface.set=function(){
      var userObj=argsToObj(arguments);

      for(var propName in userObj){
        model[propName]=userObj[propName];

        notifyObservers(propName);
      }
    };

    return component;
  }


  // TOOLTIP UI COMPONENT
  function HTML5TooltipUIComponent()
  {
    function animateElementClass(el, updateHandler)
    {
      if (!ttModel.disableAnimation) {
        // getBoundingClientRect refreshes element render box
        el.getBoundingClientRect();
        el.classList.add("animating");
        updateHandler&&updateHandler();
        setTimeout(function() { el.classList.remove("animating"); }, ttModel.animateDuration);
      }
      else
        updateHandler();
    }

    function applyAnimationClass(el, fromClass, toClass, updateHandler)
    {
      if (!ttModel.disableAnimation) {
        el.classList.add(fromClass);

        // getBoundingClientRect refreshes element render box
        el.getBoundingClientRect();

        el.classList.add("animating");
        el.classList.remove(fromClass);
        el.classList.add(toClass);

        if (updateHandler)
          updateHandler();

        setTimeout(function() {
          el.classList.remove("animating");
          el.classList.remove(toClass);
        }, ttModel.animateDuration);
      }
      else
        if (updateHandler)
          updateHandler();
    }

    function hide()
    {
      if (ttElement.style.visibility !== 'collapse')
        ttElement.style.visibility = 'collapse';
        ttElement.style.left = '-9999px';
        ttElement.style.top = '-9999px';

      if (elMore.style.display !== 'none') {
        elMore.style.display = 'none';
        elMore.style.visibility = 'collapse';
        elMore.style.height = 'auto';
      }

      return this;
    }

    function moveTooltip()
    {
      var targetRect, ttRect;

      if (!component.model.target||ttElement.style.visibility !== 'visible')
        return;

      // update width
      ttElement.style.width = "auto";
      ttRect = ttElement.getBoundingClientRect();

      var maxWidth = parseInt(ttModel.maxWidth);
      if (maxWidth)
        ttElement.style.width = ttRect.width > maxWidth ? maxWidth + "px" : "auto";

      // position depend on target and tt width
      targetRect = component.model.target.getBoundingClientRect();
      ttRect = ttElement.getBoundingClientRect();

      switch (ttModel.stickTo) {
        case html5tooltipsPredefined.stickTo.bottom:
          ttElement.style.left = targetRect.left + parseInt((targetRect.width - ttRect.width) / 2) + "px";
          ttElement.style.top = targetRect.top + targetRect.height + parseInt(ttModel.stickDistance) + "px";
          break;

        case html5tooltipsPredefined.stickTo.left:
          ttElement.style.left = targetRect.left - ttRect.width - parseInt(ttModel.stickDistance) + "px";
          ttElement.style.top = targetRect.top + (targetRect.height - ttRect.height) / 2 + "px";
          break;

        case html5tooltipsPredefined.stickTo.right:
          ttElement.style.left = targetRect.left + targetRect.width + parseInt(ttModel.stickDistance) + "px";
          ttElement.style.top = targetRect.top + (targetRect.height - ttRect.height) / 2 + "px";
          break;

        case html5tooltipsPredefined.stickTo.top:
          ttElement.style.left = targetRect.left + (targetRect.width - ttRect.width) / 2 + "px";
          ttElement.style.top = targetRect.top - ttRect.height - parseInt(ttModel.stickDistance) + "px";
          break;
      }
    }

    function show()
    {
      if (ttElement.style.visibility !== 'visible') {
        ttElement.style.visibility = 'visible';

        setTimeout(function(){
          moveTooltip();

          applyAnimationClass(elBox, ttModel.animateFunction + "-from",
            ttModel.animateFunction + "-to");
        });
      }

      return this;
    }

    function showMore()
    {
      if (ttElement.style.visibility !== 'visible') {
        ttElement.style.visibility = 'visible';

        applyAnimationClass(elBox, ttModel.animateFunction + "-from",
          ttModel.animateFunction + "-to");

        if (ttModel.contentMore) {
          elMore.style.display = 'block';
          elMore.style.visibility = 'visible';
        }

        moveTooltip();
      }
      else if (elMore.style.display !== 'block' && ttModel.contentMore) {
        elMore.style.display = 'block';

        animateElementClass(ttElement);
        moveTooltip();

        var h = elMore.getBoundingClientRect().height;
        elMore.style.visibility = 'visible';
        elMore.style.height = '0px';

        // animate more content
        animateElementClass(elMore, function() {
          elMore.style.height = h > 0 ? h + 'px' : "auto";
        });
      }

      return this;
    }

    var component=new UIComponent(this,tooltipHTML);

    var
    elBox=component.anchors.box[0],
    elText=component.anchors.text[0],
    elMore=component.anchors.more[0],
    elMoreText=component.anchors.moreText[0],
    ttElement=component.elements[0];

    hide();

    if(typeof window !== 'undefined')
      window.addEventListener("scroll", moveTooltip, false );

    component.set(defaultOptions);
    var ttModel=component.model;

    component.onModelUpdate({
      color:function(color){
        if (html5tooltipsPredefined.color[color]) {
          color = html5tooltipsPredefined.color[color];
          color = "rgb(" + color.r + ", " + color.g + ", " + color.b + ")";
        }
        elBox.style.backgroundColor = color;
      },
      contentText:function(text){
        component.anchors.text[0].innerHTML = text;
      },
      contentMore:function(more){
        component.anchors.moreText[0].innerHTML = more;
      },
      stickTo:function(stickTo){
        component.elements[0].className = "html5tooltip-" + stickTo;
      }
    });

    // PUBLIC INTERFACE
    this.hide=hide;
    this.show=show;
    this.showMore=showMore;
  }

  var userTooltips=[],DOMTooltips=[];

  function createTooltip(target,options,tooltips)
  {
    var tooltip;

    for(var i=tooltips.length;i--;)
      if(tooltips[i].model.target===target){
        tooltip=tooltips[i];
        break;
      }

    if(!tooltip){
      tooltip=new HTML5TooltipUIComponent;
      tooltips.push(tooltip);
    }

    tooltip.set(options);
    tooltip.set('target',target);

    var hovered,focused;

    target.addEventListener("mouseenter",function(){
      if (this===hovered || this===focused)
        return;

      hovered = this;
      document.body.appendChild(tooltip.elements[0]);

      setTimeout(function() {
        if (this===hovered){
          tooltip.show();
        }
      }.bind(this), tooltip.model.delay);
    });

    target.addEventListener("mouseleave",function(){
      hovered = null;

      if (this!==focused){
        tooltip.hide();
        tooltip.elements[0].parentNode&&
          tooltip.elements[0].parentNode.removeChild(tooltip.elements[0]);
      }
    });

    target.addEventListener("focus",function(){
      if (["INPUT", "TEXTAREA"].indexOf(this.tagName) === -1 &&
        this.getAttribute("contenteditable") === null)
        return;

      focused = this;

      document.body.appendChild(tooltip.elements[0]);
      tooltip.showMore();
    });

    target.addEventListener("blur",function(){
      focused = null;
      tooltip.hide();
      tooltip.elements[0].parentNode&&
        tooltip.elements[0].parentNode.removeChild(tooltip.elements[0]);
    });
  }

  function getElementsByAttribute(attr, context)
  {
    var nodeList = (context || document).getElementsByTagName('*'),
      nodes = [];

    for (var i = 0, node; node = nodeList[i]; i++) {
      if ( node.getAttribute(attr) )
        nodes.push(node);
    }

    return nodes;
  }

  function createDOMTooltips()
  {
    getElementsByAttribute("data-tooltip").forEach(function(target) {

      var options={
        animateFunction: target.getAttribute("data-tooltip-animate-function")||defaultOptions.animateFunction,
        color: target.getAttribute("data-tooltip-color")||'',
        contentMore: target.getAttribute("data-tooltip-more")||'',
        contentText: target.getAttribute("data-tooltip")||'',
        delay: target.getAttribute("data-tooltip-delay")||defaultOptions.delay,
        maxWidth: target.getAttribute("data-tooltip-maxwidth")||'auto',
        stickTo: target.getAttribute("data-tooltip-stickto")||defaultOptions.stickTo,
      };

      createTooltip(target,options,DOMTooltips);
    });
  }

  function getElementsBySelector(selector, context)
  {
    var nodes = [];

    try {
      nodes = Array.prototype.slice.call((context || document).querySelectorAll(selector));
    }
    catch (exc) {}

    return nodes;
  }

  function createUserTooltips(userTooltipsOptions)
  {
    userTooltipsOptions.forEach(function(options) {
      var targets=[];

      if (options.targetSelector)
        targets = getElementsBySelector(options.targetSelector);

      targets.forEach(function(target) {
        createTooltip(target,options,userTooltips);
      });
    });
  }

  var html5tooltips=function(userTooltipsOptions){
    if(!Array.isArray(userTooltipsOptions))
      userTooltipsOptions=[userTooltipsOptions];

  //TODO: remove DOMTooltips that share target with userTooltips

    createUserTooltips(userTooltipsOptions);
  };

  //Provides html property reading for AMD and CommonJS
  html5tooltips.autoinit=
  html5tooltips.refresh=function(){
    createDOMTooltips();
  };

  html5tooltips.getTooltipByTarget=function(target){
    for(var i=userTooltips.length;i--;)
      if(userTooltips[i].model.target===target)
        return userTooltips[i];

    for(var i=DOMTooltips.length;i--;)
      if(DOMTooltips[i].model.target===target)
        return DOMTooltips[i];
  };

  function documentLoaded()
  {
    document.removeEventListener("DOMContentLoaded",documentLoaded, false);
    window.removeEventListener("load",documentLoaded, false);

    html5tooltips.refresh();
  }

  if(typeof window!=='undefined'){
    if (document.readyState === "complete") {
      documentLoaded();

    } else {
      document.addEventListener("DOMContentLoaded",documentLoaded, false);
      window.addEventListener( "load", documentLoaded, false );
    }

    if (!window.html5tooltipsPredefined) {
      window.html5tooltipsPredefined = html5tooltipsPredefined;
      window.HTML5TooltipUIComponent=HTML5TooltipUIComponent;
    }
  }

  return html5tooltips;
}));
