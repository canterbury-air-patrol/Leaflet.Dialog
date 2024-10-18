import './Leaflet.Dialog'
import './Leaflet.Dialog.css'

import L from 'leaflet'

import $ from 'jquery'

const map = L.map('map').setView([42.8962176, -78.9247419], 12)

L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map)

const contents = [
  '<p>Hello! Welcome to your nice new dialog box!</p>',
  '<button class="btn btn-primary" id="setsize_btn">dialog.setSize([ 350, 350 ])</button><br/><br/>',
  '<button class="btn btn-primary" id="setlocation_btn">dialog.setLocation([ 50, 50 ])</button><br/><br/>',
  '<button class="btn btn-danger" id="freeze_btn">dialog.freeze()</button>&nbsp;&nbsp;',
  '<button class="btn btn-success" id="unfreeze_btn">dialog.unfreeze()</button><br/><br/>',
  '<button class="btn btn-danger" id="hideclose_btn">dialog.hideClose()</button>',
  '<button class="btn btn-success" id="showclose_btn">dialog.showClose()</button><br/><br/>',
  '<button class="btn btn-danger" id="hideresize_btn">dialog.hideResize()</button>',
  '<button class="btn btn-success" id="showresize_btn">dialog.showResize()</button><br/><br/>'
].join('')

const dialog = L.control.dialog().setContent(contents).addTo(map)

$('#setsize_btn').on('click', function () { dialog.setSize([350, 350]) })
$('#setlocation_btn').on('click', function () { dialog.setLocation([50, 50]) })
$('#freeze_btn').on('click', function () { dialog.freeze() })
$('#unfreeze_btn').on('click', function () { dialog.unfreeze() })
$('#hideclose_btn').on('click', function () { dialog.hideClose() })
$('#showclose_btn').on('click', function () { dialog.showClose() })
$('#hideresize_btn').on('click', function () { dialog.hideResize() })
$('#showresize_btn').on('click', function () { dialog.showResize() })

map.on('dialog:opened', function () { console.log('dialog opened event fired.') })
map.on('dialog:closed', function () { console.log('dialog closed event fired.') })
map.on('dialog:destroyed', function () { console.log('dialog destroyed event fired.') })
map.on('dialog:locked', function () { console.log('dialog locked event fired.') })
map.on('dialog:unlocked', function () { console.log('dialog unlocked event fired.') })
map.on('dialog:frozen', function () { console.log('dialog frozen event fired.') })
map.on('dialog:unfrozen', function () { console.log('dialog unfrozen event fired.') })
map.on('dialog:updated', function () { console.log('dialog updated event fired.') })
map.on('dialog:resizestart', function () { console.log('dialog resizestart event fired.') })
map.on('dialog:resizing', function () { console.log('dialog resizing event fired.') })
map.on('dialog:resizeend', function () { console.log('dialog resizeend event fired.') })
map.on('dialog:movestart', function () { console.log('dialog movestart event fired.') })
map.on('dialog:moving', function () { console.log('dialog moving event fired.') })
map.on('dialog:moveend', function () { console.log('dialog moveend event fired.') })
map.on('dialog:closehidden', function () { console.log('dialog closehidden event fired.') })
map.on('dialog:closeshown', function () { console.log('dialog closeshown event fired.') })
map.on('dialog:resizehidden', function () { console.log('dialog resizehidden event fired.') })
map.on('dialog:resizeshown', function () { console.log('dialog resizeshown event fired.') })
