/**
 * @module M/plugin/SpatialCalculator
 */

import 'assets/css/spatialcalculator';
import SpatialCalculatorControl from './spatialcalculatorcontrol';
import api from '../../api';

/**
 * @classdesc
 * Main facade plugin object. This class creates a plugin
 * object which has an implementation Object
 *
 * @constructor
 * @extends {M.Plugin}
 * @param {Object} impl implementation object
 * @api stable
 */
export default class SpatialCalculator extends M.Plugin {
  constructor(options = {}) {
    super();

    /**
     * Facade of the map
     * @private
     * @type {M.Map}
     */
    this.map_ = null;

    /**
     * Array of controls
     * @private
     * @type {M.Control}
     */
    this.control_ = null;

    /**
     * Position of the Plugin
     * Posible values: TR | TL | BL | BR
     * @type {Enum}
     */
    this.position_ = options.position || 'TR';

    /**
     * Classname of html Plugin
     *
     * @private
     * @type {String}
     */
    this.className_ = 'm-spatialcalculator';

    /**
     * Collapsible Plugin
     *
     * @private
     * @type {boolean}
     */
    this.collapsible_ = true;

    /**
     * Text of Tooltip
     *
     * @private
     * @type {String}
     */
    this.tooltip_ = 'Calculadora espacial';

    /**
     * Metadata from api.json
     * @private
     * @type {Object}
     */
    this.metadata_ = api.metadata;
  }

  /**
   * This function adds this plugin into the map
   *
   * @public
   * @function
   * @param {M.Map} map the map to add the plugin
   * @api stable
   */

  addTo(map) {
    const pluginOnLeft = !!(['TL', 'BL'].includes(this.position_));
    const values = {
      pluginOnLeft,
    };

    this.map_ = map;
    this.control_ = new SpatialCalculatorControl(values);

    this.panel_ = new M.ui.Panel('SpatialCalculatorPanel', {
      collapsible: this.collapsible_,
      className: this.className_,
      collapsedButtonClass: 'g-cartografia-localizacion',
      position: M.ui.position[this.position_],
      tooltip: this.tooltip_,
    });

    this.panel_.addControls(this.control_);
    this.map_.addPanels(this.panel_);
    this.control_.on(M.evt.ADDED_TO_MAP, () => {
      this.fire(M.evt.ADDED_TO_MAP);
    });
  }

  destroy() {
    this.map_.removeControls([this.control_]);
    [this.map_, this.control_, this.panel_] = [null, null, null];
  }

  /**
   * @getter
   * @public
   */
  get name() {
    return 'spatialcalculator';
  }

  /**
   * This functions returns the controls of the plugin.
   *
   * @public
   * @return {M.Control}
   * @api
   */
  get control() {
    return this.control_;
  }

  /**
   * This function gets metadata plugin
   *
   * @public
   * @function
   * @api stable
   */
  getMetadata() {
    return this.metadata_;
  }
}
