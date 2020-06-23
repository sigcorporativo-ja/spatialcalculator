import SpatialCalculator from 'facade/spatialcalculator';

const map = M.map({
  container: 'mapjs',
});

const mp = new SpatialCalculator();

map.addPlugin(mp);
