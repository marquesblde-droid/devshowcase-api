const express = require('express');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();


app.use(express.json());


app.get('/', (req, res) => {
  return res.json({ message: 'API DevShowcase funcionando perfeitamente!' });
});


app.post('/profiles', async (req, res) => {
  try {
    const { name, email, bio } = req.body;
    const profile = await prisma.profile.create({
      data: { name, email, bio }
    });
    return res.status(201).json(profile);
  } catch (error) {
    return res.status(400).json({ error: 'Erro ao criar perfil ou e-mail já cadastrado.' });
  }
});


app.get('/profiles', async (req, res) => {
  const profiles = await prisma.profile.findMany({
    include: { projects: true }
  });
  return res.json(profiles);
});


app.post('/projects', async (req, res) => {
  try {
    const { title, description, url, profileId } = req.body;
    const project = await prisma.project.create({
      data: { title, description, url, profileId }
    });
    return res.status(201).json(project);
  } catch (error) {
    return res.status(400).json({ error: 'Erro ao criar projeto. Verifique o profileId.' });
  }
});


app.get('/projects', async (req, res) => {
  const projects = await prisma.project.findMany({
    include: { profile: true, feedbacks: true, technologies: true }
  });
  return res.json(projects);
});


app.post('/technologies', async (req, res) => {
  try {
    const { name } = req.body;
    const technology = await prisma.technology.create({
      data: { name }
    });
    return res.status(201).json(technology);
  } catch (error) {
    return res.status(400).json({ error: 'Erro ao criar tecnologia.' });
  }
});


app.get('/technologies', async (req, res) => {
  const technologies = await prisma.technology.findMany();
  return res.json(technologies);
});


app.post('/feedbacks', async (req, res) => {
  try {
    const { comment, projectId } = req.body;
    const feedback = await prisma.feedback.create({
      data: { comment, projectId }
    });
    return res.status(201).json(feedback);
  } catch (error) {
    return res.status(400).json({ error: 'Erro ao criar feedback. Verifique o projectId.' });
  }
});


app.listen(3000, () => {
  console.log('Servidor DevShowcase rodando em http://localhost:3000');
});