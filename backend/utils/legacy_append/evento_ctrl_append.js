
export async function createEvento(req, res) {
  try {
    const evento = await createEventoModel(req.body);
    res.status(201).json({ evento });
  } catch (err) {
    console.error('[eventos] crear:', err);
    res.status(500).json({ error: 'No se pudo crear el evento.' });
  }
}

export async function updateEvento(req, res) {
  try {
    const evento = await updateEventoModel(req.params.slug, req.body);
    if (!evento) return res.status(404).json({ error: 'Evento no encontrado.' });
    res.json({ evento });
  } catch (err) {
    console.error('[eventos] actualizar:', err);
    res.status(500).json({ error: 'No se pudo actualizar el evento.' });
  }
}

export async function deleteEvento(req, res) {
  try {
    const deleted = await deleteEventoModel(req.params.slug);
    if (!deleted) return res.status(404).json({ error: 'Evento no encontrado.' });
    res.json({ success: true });
  } catch (err) {
    console.error('[eventos] eliminar:', err);
    res.status(500).json({ error: 'No se pudo eliminar el evento.' });
  }
}
