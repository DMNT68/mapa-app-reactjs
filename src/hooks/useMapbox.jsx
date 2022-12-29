import { useCallback, useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { v4 } from 'uuid';
import { Subject } from 'rxjs';

mapboxgl.accessToken = 'pk.eyJ1IjoiYW5kcmVzc2FsZ2Fkb2MxIiwiYSI6ImNsYzZlODE5bTIzcXYzeHFta25vOW42ajcifQ.7qhjJOSHDKV-iHRlSzrHbg';

export const useMapbox = (puntoInicial) => {
  // Referencia al DIV del mapa
  const mapaDiv = useRef();
  const setRef = useCallback((node) => {
    mapaDiv.current = node;
  }, []);

  //  Referencia a las marcadores
  const marcadores = useRef({});

  // Observables de rxjs
  const movimientoMarcador = useRef(new Subject());
  const nuevoMarcador = useRef(new Subject());

  // Mapa y coords
  const mapa = useRef();
  const [coords, setCoords] = useState(puntoInicial);

  // función para agregar marcadores
  const agregarMarcador = useCallback((ev, id) => {
    const { lng, lat } = ev.lngLat || ev;

    const marker = new mapboxgl.Marker();
    marker.id = id ?? v4();

    marker.setLngLat([lng, lat]).addTo(mapa.current).setDraggable(true);

    // Asignamos al objeto de marcadores
    marcadores.current[marker.id] = marker;
    
    if (!id) {
      nuevoMarcador.current.next({
        id: marker.id,
        lat,
        lng,
      });
    }

    // escuchar movimientos del marcador
    marker.on('drag', ({ target }) => {
      const { id } = target;
      const { lng, lat } = target.getLngLat();

      // emitir los cambios del marcador
      movimientoMarcador.current.next({
        id,
        lat,
        lng,
      });
    });
  }, []);

  // Función para actualizar la ubicación de marcador
  const actualizarPosicion = useCallback(({ id, lng, lat }) => {
    marcadores.current[id].setLngLat([lng, lat]);
  }, []);

  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapaDiv.current, // container ID
      style: 'mapbox://styles/mapbox/streets-v12', // style URL
      center: [puntoInicial.lng, puntoInicial.lat], // starting position [lng, lat]
      zoom: puntoInicial.zoom, // starting zoom: ;
    });

    mapa.current = map;
  }, [puntoInicial]);

  //   Cuando se mueve el mapa
  useEffect(() => {
    mapa.current?.on('move', () => {
      const { lng, lat } = mapa.current.getCenter();
      setCoords({
        lng: lng.toFixed(4),
        lat: lat.toFixed(4),
        zoom: mapa.current.getZoom().toFixed(2),
      });
    });
    // return mapa?.off('move');
  }, []);

  //   Agregar marcadores cuando se hace click
  useEffect(() => {
    mapa.current?.on('click', agregarMarcador);
  }, [agregarMarcador]);

  return {
    //
    coords,
    setRef,
    agregarMarcador,
    nuevoMarcador$: nuevoMarcador.current,
    movimientoMarcador$: movimientoMarcador.current,
    actualizarPosicion,
  };
};
