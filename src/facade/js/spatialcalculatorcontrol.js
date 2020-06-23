/**
 * @module M/plugin/SpatialCalculatorControl
 */

import SpatialCalculatorImpl from 'impl/spatialcalculatorcontrol';
import template from 'templates/spatialcalculator';

/**
 * @classdesc
 * Main constructor of the class. Creates a spatialcalculatorControl
 * control
 *
 * @constructor
 * @extends {M.Control}
 * @api stable
 */
export default class SpatialCalculatorControl extends M.Control {
  constructor(values) {
    // checks if the implementation can create spatialcalculatorControl
    if (M.utils.isUndefined(SpatialCalculatorImpl)) {
      M.exception('La implementación usada no puede crear controles spatialcalculatorControl');
    }
    // implementation of this control
    const impl = new SpatialCalculatorImpl();
    super(impl, 'spatialcalculator');
    this.pluginOnLeft = values.pluginOnLeft;
  }

  /**
   * This function creates the view
   *
   * @public
   * @function
   * @param {M.Map} map to add the control
   * @api stable
   */
  createView(map) {
    this.map_ = map;
    return new Promise((success, fail) => {
      // Desplazar open button
      if (this.pluginOnLeft) {
        document.querySelector('.m-panel.m-spatialcalculator').querySelector('.g-cartografia-localizacion').addEventListener('click', (evt) => {
          let buttonOpened = document.querySelector('.m-panel.m-spatialcalculator.opened');
          if (buttonOpened !== null) {
            buttonOpened = buttonOpened.querySelector('.m-panel-btn.g-cartografia-flecha-izquierda');
          }
          if (buttonOpened && this.pluginOnLeft) {
            buttonOpened.classList.add('opened-left');
          }
        });
      }

      const html = M.template.compileSync(template);
      this.template_ = html;
      this.btnCalculate = html.querySelector('button#m-spatialcalculator-calculate');
      this.selectSRS = html.querySelector('select#m-spatialcalculator-srs');
      this.btnClean = html.querySelector('button#m-spatialcalculator-clean');
      this.btnCalculate.addEventListener('click', e => this.calculate_(e));
      this.selectSRS.addEventListener('change', e => this.manageInputs_(e));
      this.btnClean.addEventListener('click', e => this.cleanInputs_(e));
      success(this.template_);
    });
  }

  /**
   * @public
   * @function
   * @api stable
   * @export
   */
  copyText_(value) {
    document.body.insertAdjacentHTML('beforeend', `<div id="copy" contenteditable>${value}</div>`);
    document.getElementById('copy').focus();
    document.execCommand('selectAll');
    document.execCommand('copy');
    document.getElementById('copy').remove();
  }

  /**
   * @public
   * @function
   * @api stable
   * @export
   */
  cleanInputs_(e) {
    document.querySelector('div#m-spatialcalculator-result').innerHTML = '';
    document.querySelector('#UTM-X').value = '';
    document.querySelector('#UTM-Y').value = '';
    document.querySelector('#LON').value = '';
    document.querySelector('#LAT').value = '';
  }

  /**
   * @public
   * @function
   * @api stable
   * @export
   */
  manageInputs_(evt) {
    const selectTarget = evt.target;
    const origin = selectTarget.options[selectTarget.selectedIndex].value;
    if (origin.indexOf('4326') >= 0 || origin.indexOf('4258') >= 0 || origin.indexOf('4230') >= 0) {
      const divToHidden = document.querySelector('div#m-spatialcalculator-utm');
      divToHidden.style.display = 'none';
      const divToShow = document.querySelector('div#m-spatialcalculator-latlon');
      divToShow.style.display = 'block';
    } else {
      const divToHidden = document.querySelector('div#m-spatialcalculator-latlon');
      divToHidden.style.display = 'none';
      const divToShow = document.querySelector('div#m-spatialcalculator-utm');
      divToShow.style.display = 'block';
    }
  }

  /**
   * @public
   * @function
   * @api stable
   * @export
   */
  calculate_(evt) {
    try {
      const selectTarget = document.querySelector('select#m-spatialcalculator-srs');
      const origin = selectTarget.options[selectTarget.selectedIndex].value;

      const destTarget = document.querySelector('select#m-spatialcalculator-srs-target');
      const originReproject = destTarget.options[destTarget.selectedIndex].value;

      let x = -1;
      let y = -1;
      let xString = '';
      let yString = '';
      if (origin.indexOf('4326') >= 0 || origin.indexOf('4258') >= 0 ||
        origin.indexOf('4230') >= 0) {
        xString = document.querySelector('div#m-spatialcalculator-latlon input#LON').value;
        yString = document.querySelector('div#m-spatialcalculator-latlon input#LAT').value;
        x = parseFloat(xString);
        y = parseFloat(yString);
      } else {
        xString = document.querySelector('div#m-spatialcalculator-utm input#UTM-X').value;
        yString = document.querySelector('div#m-spatialcalculator-utm input#UTM-Y').value;
        x = parseFloat(xString);
        y = parseFloat(yString);
      }

      const originProj = ol.proj.get(origin);
      const dstProj = ol.proj.get(originReproject);

      const xround = Math.round(x * 100) / 100;
      const yround = Math.round(y * 100) / 100;
      const coordinatesTransform =
        ol.proj.transform([xround, yround], originProj, dstProj);
      const resultContainer = document.querySelector('div#m-spatialcalculator-result');

      if (!Number.isNaN(coordinatesTransform[0]) && !Number.isNaN(coordinatesTransform[1])) {
        let Xcoord;
        let Ycoord;
        if (originReproject.indexOf('4326') >= 0 || originReproject.indexOf('4258') >= 0 || originReproject.indexOf('4230') >= 0) {
          Xcoord = coordinatesTransform[0].toFixed(9);
          Ycoord = coordinatesTransform[1].toFixed(9);
          document.getElementById('resultado').innerHTML = 'Resultado (LON,LAT)';
        } else {
          Xcoord = coordinatesTransform[0].toFixed(2);
          Ycoord = coordinatesTransform[1].toFixed(2);
          document.getElementById('resultado').innerHTML = 'Resultado (X,Y)';
        }

        resultContainer.innerHTML = `${Xcoord} , ${Ycoord}`;

        const buttonCopy = document.createElement('button');
        buttonCopy.id = 'm-spatialcalculator-copy';
        buttonCopy.title = 'Copiar en el portapapeles';

        const icon = document.createElement('i');
        icon.classList.add('g-cartografia-texto');
        icon.innerHTML = ' Copiar';

        buttonCopy.addEventListener('click', e => this.copyText_(coordinatesTransform));
        buttonCopy.appendChild(icon);
        resultContainer.appendChild(buttonCopy);
      } else {
        resultContainer.innerHTML = 'Introduzca valores por favor';
      }
    } catch (ex) {
      M.dialog.error('Error realizando la transformación', 'Error');
      document.querySelector('div#m-spatialcalculator-result').innerHTML = '';
    }
  }

  /**
   * This function compares controls
   *
   * @public
   * @function
   * @param {M.Control} control to compare
   * @api stable
   */
  equals(obj) {
    let equals = false;
    if (obj instanceof SpatialCalculatorControl) {
      equals = (this.name === obj.name);
    }
    return equals;
  }
}
