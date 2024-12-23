import '@fortawesome/fontawesome-free'
import '@fortawesome/fontawesome-free/css/all.min.css'

import L from 'leaflet'

L.Control.Dialog = L.Control.extend({
  options: {
    size: [300, 300],
    minSize: [100, 100],
    maxSize: [350, 350],
    anchor: [250, 250],
    position: 'topleft',
    initOpen: true,
    title: null,
    iconClass: {
      grabber: 'fa-solid fa-arrows-alt',
      close: 'fa-solid fa-times',
      resize: 'fa-solid fa-arrows-alt-h fa-rotate-45',
      collapse: 'fa-solid caret-down',
      expand: 'fa-solid caret-up'
    }
  },

  initialize: function (options) {
    L.setOptions(this, options)

    this._attributions = {}
    this._collapsed = false
  },

  onAdd: function (map) {
    this._initLayout()
    this._map = map

    this.update()

    if (!this.options.initOpen) {
      this.close()
    }

    return this._container
  },

  open: function () {
    if (!this._map) {
      return
    }
    this._container.style.visibility = ''
    this._toogle = this.close

    this._map.fire('dialog:opened', this)

    return this
  },

  close: function () {
    this._container.style.visibility = 'hidden'
    this._toogle = this.open

    this._map.fire('dialog:closed', this)
    return this
  },

  toggle: function () {
    return this._toggle()
  },

  _toggle: function () {
    // update, open, and close change _toggle as needed
    return this
  },

  destroy: function () {
    if (!this._map) {
      return this
    }

    this._map.fire('dialog:destroyed', this)
    this.remove()

    if (this.onRemove) {
      this.onRemove(this._map)
    }

    return this
  },

  setLocation: function (location) {
    location = location || [250, 250]

    this.options.anchor[0] = 0
    this.options.anchor[1] = 0
    this._oldMousePos.x = 0
    this._oldMousePos.y = 0

    this._move(location[1], location[0])

    return this
  },

  setSize: function (size) {
    size = size || [300, 300]

    this.options.size[0] = 0
    this.options.size[1] = 0
    this._oldMousePos.x = 0
    this._oldMousePos.y = 0

    this._resize(size[0], size[1])

    return this
  },

  lock: function () {
    this._resizerNode.style.visibility = 'hidden'
    this._grabberNode.style.visibility = 'hidden'
    this._closeNode.style.visibility = 'hidden'

    this._map.fire('dialog:locked', this)
    return this
  },

  unlock: function () {
    this._resizerNode.style.visibility = ''
    this._grabberNode.style.visibility = ''
    this._closeNode.style.visibility = ''

    this._map.fire('dialog:unlocked', this)
    return this
  },

  freeze: function () {
    this._resizerNode.style.visibility = 'hidden'
    this._grabberNode.style.visibility = 'hidden'

    this._map.fire('dialog:frozen', this)
    return this
  },

  unfreeze: function () {
    this._resizerNode.style.visibility = ''
    this._grabberNode.style.visibility = ''

    this._map.fire('dialog:unfrozen', this)
    return this
  },

  hideClose: function () {
    this._closeNode.style.visibility = 'hidden'

    this._map.fire('dialog:closehidden', this)
    return this
  },

  showClose: function () {
    this._closeNode.style.visibility = ''

    this._map.fire('dialog:closeshown', this)
    return this
  },

  hideResize: function () {
    this._resizerNode.style.visibility = 'hidden'

    this._map.fire('dialog:resizehidden', this)
    return this
  },

  showResize: function () {
    this._resizerNode.style.visibility = ''

    this._map.fire('dialog:resizeshown', this)
    return this
  },

  setContent: function (content) {
    this._content = content
    this.update()
    return this
  },

  getContent: function () {
    return this._content
  },

  getElement: function () {
    return this._container
  },

  update: function () {
    if (!this._map) {
      return
    }

    this._container.style.visibility = 'hidden'

    this._updateContent()
    this._updateLayout()

    this._container.style.visibility = ''
    this._toggle = this.close
    this._map.fire('dialog:updated', this)
  },

  _initLayout: function () {
    const className = 'leaflet-control-dialog'
    const container = (this._container = L.DomUtil.create('div', className))

    container.style.width = this.options.size[0] + 'px'
    container.style.height = this.options.size[1] + 'px'

    container.style.top = this.options.anchor[0] + 'px'
    container.style.left = this.options.anchor[1] + 'px'

    const stop = L.DomEvent.stopPropagation
    L.DomEvent.on(container, 'click', stop)
      .on(container, 'mousedown', stop)
      .on(container, 'touchstart', stop)
      .on(container, 'dblclick', stop)
      .on(container, 'mousewheel', stop)
      .on(container, 'contextmenu', stop)
      .on(container, 'MozMousePixelScroll', stop)

    const innerContainer = (this._innerContainer = L.DomUtil.create('div', className + '-inner'))

    let grabberNode = null
    if (this.options.title) {
      grabberNode = this._resizerNode = L.DomUtil.create('div', className + '-grabber-title')
      grabberNode.innerHTML = this.options.title
    } else {
      grabberNode = this._grabberNode = L.DomUtil.create('div', className + '-grabber')
      const grabberIcon = L.DomUtil.create('i', this.options.iconClass.grabber)
      grabberNode.appendChild(grabberIcon)
    }

    L.DomEvent.on(grabberNode, 'mousedown', this._handleMoveStart, this)
    L.DomEvent.on(grabberNode, 'touchstart', this._handleTouchMoveStart, this)

    const closeNode = (this._closeNode = L.DomUtil.create('div', className + '-close'))
    const closeIcon = L.DomUtil.create('i', this.options.iconClass.close)
    closeNode.appendChild(closeIcon)
    L.DomEvent.on(closeNode, 'click', this._handleClose, this)

    L.DomEvent.on(grabberNode, 'mousedown', this._handleMoveStart, this)

    const collapseNode = (this._collapse = L.DomUtil.create('div', className + '-collapse'))
    this._collapseIcon = L.DomUtil.create('i', this.options.iconClass.collapse)
    collapseNode.appendChild(this._collapseIcon)
    L.DomEvent.on(collapseNode, 'click', this._handleCollapse, this)

    const resizerNode = (this._resizerNode = L.DomUtil.create('div', className + '-resizer'))
    const resizeIcon = L.DomUtil.create('i', this.options.iconClass.resize)
    resizerNode.appendChild(resizeIcon)

    L.DomEvent.on(resizerNode, 'mousedown', this._handleResizeStart, this)
    L.DomEvent.on(resizerNode, 'touchstart', this._handleTouchResizeStart, this)

    const contentNode = (this._contentNode = L.DomUtil.create('div', className + '-contents'))

    container.appendChild(innerContainer)

    innerContainer.appendChild(contentNode)
    innerContainer.appendChild(grabberNode)
    innerContainer.appendChild(closeNode)
    innerContainer.appendChild(collapseNode)
    innerContainer.appendChild(resizerNode)

    this._oldMousePos = { x: 0, y: 0 }
  },

  _handleCollapse: function () {
    this._collapsed = !this._collapsed
    if (this._collapsed) {
      this._rmClasses(this._collapseIcon, this.options.iconClass.collapse)
      this._addClasses(this._collapseIcon, this.options.iconClass.expand)
      L.DomUtil.addClass(this._container, 'dialog-hidden')
      this._container._h = this._container.style.height
      this._container.style.height = '30px'
    } else {
      this._rmClasses(this._collapseIcon, this.options.iconClass.expand)
      this._addClasses(this._collapseIcon, this.options.iconClass.collapse)
      L.DomUtil.removeClass(this._container, 'dialog-hidden')
      this._container.style.height = this._container._h
    }
    console.log('_handleCollapse', this._collapsed)
  },

  _rmClasses: function (el, str) {
    const arr = str.split(' ')
    for (const k in arr) {
      L.DomUtil.removeClass(el, arr[k])
    }
  },

  _addClasses: function (el, str) {
    const arr = str.split(' ')
    for (const k in arr) {
      L.DomUtil.addClass(el, arr[k])
    }
  },

  _handleClose: function () {
    this.close()
  },

  _handleResizeStart: function (e) {
    this._oldMousePos.x = e.clientX
    this._oldMousePos.y = e.clientY

    L.DomEvent.on(this._map, 'mousemove', this._handleMouseMove, this)
    L.DomEvent.on(this._map, 'mouseup', this._handleMouseUp, this)

    this._map.fire('dialog:resizestart', this)
    this._resizing = true
  },

  _handleTouchResizeStart: function (e) {
    this._oldMousePos.x = e.clientX
    this._oldMousePos.y = e.clientY

    L.DomEvent.on(this._resizerNode, 'touchmove', this._handleTouchResize, this)
    L.DomEvent.on(this._resizerNode, 'touchend', this._handleTouchResizeEnd, this)

    this._map.fire('dialog:resizestart', this)
    this._resizing = true
  },

  _handleMoveStart: function (e) {
    this._oldMousePos.x = e.clientX
    this._oldMousePos.y = e.clientY

    L.DomEvent.on(this._map, 'mousemove', this._handleMouseMove, this)
    L.DomEvent.on(this._map, 'mouseup', this._handleMouseUp, this)

    this._map.fire('dialog:movestart', this)
    this._moving = true
  },

  _handleTouchMoveStart: function (e) {
    this._oldMousePos.x = e.clientX
    this._oldMousePos.y = e.clientY

    L.DomEvent.on(this._grabberNode, 'touchmove', this._handleTouchMove, this)
    L.DomEvent.on(this._grabberNode, 'touchend', this._handleTouchMoveEnd, this)

    this._map.fire('dialog:movestart', this)
    this._moving = true
  },

  _handleMouseMove: function (e) {
    const diffX = e.originalEvent.clientX - this._oldMousePos.x
    const diffY = e.originalEvent.clientY - this._oldMousePos.y

    // this helps prevent accidental highlighting on drag:
    if (e.originalEvent.stopPropagation) {
      e.originalEvent.stopPropagation()
    }
    if (e.originalEvent.preventDefault) {
      e.originalEvent.preventDefault()
    }

    if (this._resizing) {
      this._resize(diffX, diffY)
    }

    if (this._moving) {
      this._move(diffX, diffY)
    }
  },

  _handleTouchMove: function (e) {
    const diffX = e.clientX - this._oldMousePos.x
    const diffY = e.clientY - this._oldMousePos.y

    this._move(diffX, diffY)
  },

  _handleTouchResize: function (e) {
    const diffX = e.clientX - this._oldMousePos.x
    const diffY = e.clientY - this._oldMousePos.y

    this._resize(diffX, diffY)
  },

  _handleMouseUp: function () {
    L.DomEvent.off(this._map, 'mousemove', this._handleMouseMove, this)
    L.DomEvent.off(this._map, 'mouseup', this._handleMouseUp, this)

    if (this._resizing) {
      this._resizing = false
      this._map.fire('dialog:resizeend', this)
    }

    if (this._moving) {
      this._moving = false
      this._map.fire('dialog:moveend', this)
    }
  },

  _handleTouchResizeEnd: function () {
    L.DomEvent.off(this._resizerNode, 'touchmove', this._handleTouchResize, this)
    L.DomEvent.off(this._resizerNode, 'touchup', this._handleTouchResizeEnd, this)

    this._resizing = false
    this._map.fire('dialog:resizeend', this)

    this._moving = false
    this._map.fire('dialog:moveend', this)
  },

  _handleTouchMoveEnd: function () {
    L.DomEvent.off(this._grabberNode, 'touchmove', this._handleTouchMove, this)
    L.DomEvent.off(this._grabberNode, 'touchup', this._handleTouchMoveEnd, this)

    this._moving = false
    this._map.fire('dialog:moveend', this)
  },

  _move: function (diffX, diffY) {
    const newY = this.options.anchor[0] + diffY
    const newX = this.options.anchor[1] + diffX

    this.options.anchor[0] = newY
    this.options.anchor[1] = newX

    this._container.style.top = this.options.anchor[0] + 'px'
    this._container.style.left = this.options.anchor[1] + 'px'

    this._map.fire('dialog:moving', this)

    this._oldMousePos.y += diffY
    this._oldMousePos.x += diffX
  },

  _resize: function (diffX, diffY) {
    const newX = this.options.size[0] + diffX
    const newY = this.options.size[1] + diffY

    if (newX <= this.options.maxSize[0] && newX >= this.options.minSize[0]) {
      this.options.size[0] = newX
      this._container.style.width = this.options.size[0] + 'px'
      this._oldMousePos.x += diffX
    }

    if (newY <= this.options.maxSize[1] && newY >= this.options.minSize[1]) {
      this.options.size[1] = newY
      this._container.style.height = this.options.size[1] + 'px'
      this._oldMousePos.y += diffY
    }

    this._map.fire('dialog:resizing', this)
  },

  _updateContent: function () {
    if (!this._content) {
      return
    }

    const node = this._contentNode
    const content = typeof this._content === 'function' ? this._content(this) : this._content

    if (typeof content === 'string') {
      node.innerHTML = content
    } else {
      while (node.hasChildNodes()) {
        node.removeChild(node.firstChild)
      }
      node.appendChild(content)
    }
  },

  _updateLayout: function () {
    this._container.style.width = this.options.size[0] + 'px'
    this._container.style.height = this.options.size[1] + 'px'

    this._container.style.top = this.options.anchor[0] + 'px'
    this._container.style.left = this.options.anchor[1] + 'px'
  }
})

L.control.dialog = function (options) {
  return new L.Control.Dialog(options)
}
