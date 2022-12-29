import { useContext, useEffect } from 'react';
import { SocketContext } from '../context/SocketContext';
import { useMapbox } from '../hooks/useMapbox';

const puntoInicial = {
  lng: -78.1067672,
  lat: 0.3465641,
  zoom: 15,
};

export const MapaPage = () => {
  const { coords, setRef, nuevoMarcador$, movimientoMarcador$, agregarMarcador, actualizarPosicion } = useMapbox(puntoInicial);
  const { socket } = useContext(SocketContext);

  // Escuchar los marcadores existentes
  useEffect(() => {
    socket.on('marcadores-activos', (marcadores) => {
      for (const key of Object.keys(marcadores)) {
        agregarMarcador(marcadores[key], key);
      }
    });
  }, [socket, agregarMarcador]);

  // Nuevo marcador
  useEffect(() => {
    nuevoMarcador$.subscribe((marcador) => {
      socket.emit('marcador-nuevo', marcador);
    });
  }, [nuevoMarcador$, socket]);

  // Movimiento de marcador
  useEffect(() => {
    movimientoMarcador$.subscribe((marcador) => {
      socket.emit('marcador-actualizado', marcador);
    });
  }, [socket, movimientoMarcador$]);

  // mover el marcador mediante sockets
  useEffect(() => {
    socket.on('marcador-actualizado', (marcador) => {
      actualizarPosicion(marcador);
    });
  }, [socket, actualizarPosicion]);

  // escuchar nuevos marcadores
  useEffect(() => {
    socket.on('marcador-nuevo', (marcador) => {
      console.log(marcador);
      agregarMarcador(marcador, marcador.id);
    });
  }, [socket, agregarMarcador]);

  return (
    <>
      <div className="info">
        lng: {coords.lng} | lat:{coords.lat} | zoom: {coords.zoom}
      </div>
      <div ref={setRef} className="mapContainer" />
    </>
  );
};
