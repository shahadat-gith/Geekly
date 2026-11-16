import {
  generateArticleDiagramImage,
  getArticleDiagram,
  listArticleDiagrams,
  uploadArticleDiagramImageAsset,
} from '../services/diagramService.js';
import { validatedImage } from '../utils/imageUpload.js';

export async function listDiagrams(req, res) {
  res.json(await listArticleDiagrams(req.params.id));
}

export async function getDiagram(req, res) {
  res.json(await getArticleDiagram(req.params.id, req.params.diagramId));
}

export async function generateDiagramImage(req, res) {
  res.json(await generateArticleDiagramImage(req.params.id, req.params.diagramId));
}

export async function uploadDiagramImage(req, res) {
  const image = await validatedImage(req.file);
  res.status(201).json(
    await uploadArticleDiagramImageAsset(req.params.id, req.params.diagramId, image),
  );
}
