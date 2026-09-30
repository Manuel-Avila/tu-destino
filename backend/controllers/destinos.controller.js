import {
  listDestinos, findDestinoById, createDestino, updateDestino, deleteDestino
} from '../models/destino.model.js';

export async function getAll(req, res) {
  try {
    const destinos = await listDestinos();
    res.json({ destinos });
  } catch (err) {
    console.error('[destinos] listar:', err);
    res.status(500).json({ error: 'Error al listar destinos' });
  }
}

export async function getOne(req, res) {
  try {
    const destino = await findDestinoById(req.params.id);
    if (!destino) return res.status(404).json({ error: 'Destino no encontrado' });
    res.json({ destino });
  } catch (err) {
    console.error('[destinos] detalle:', err);
    res.status(500).json({ error: 'Error al obtener destino' });
  }
}

export async function create(req, res) {
  try {
    const destino = await createDestino(req.body);
    res.status(201).json({ destino });
  } catch (err) {
    console.error('[destinos] crear:', err);
    res.status(500).json({ error: 'Error al crear destino' });
  }
}

export async function update(req, res) {
  try {
    const destino = await updateDestino(req.params.id, req.body);
    if (!destino) return res.status(404).json({ error: 'Destino no encontrado' });
    res.json({ destino });
  } catch (err) {
    console.error('[destinos] actualizar:', err);
    res.status(500).json({ error: 'Error al actualizar destino' });
  }
}

export async function remove(req, res) {
  try {
    const deleted = await deleteDestino(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Destino no encontrado' });
    res.json({ success: true });
  } catch (err) {
    console.error('[destinos] eliminar:', err);
    res.status(500).json({ error: 'Error al eliminar destino' });
  }
}
