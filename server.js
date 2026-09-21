const express = require('express');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();

// Permite que o Express entenda dados no formato JSON
app.use(express.json());

// Rota de teste inicial
app.get('/', (req, res) => {
  return res.json({ message: 'API DevShowcase funcionando perfeitamente!' });
});

// ==========================================
// 1. ROTAS DE PERFIL (PROFILE)
// ==========================================

// Criar Perfil
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

// Listar todos os Perfis (com seus projetos)
app.get('/profiles', async (req, res) => {
  const profiles = await prisma.profile.findMany({
    include: { projects: true }
  });
  return res.json(profiles);
});

// ==========================================
// 2. ROTAS DE PROJETO (PROJECT)
// ==========================================

// Criar Projeto (vinculado a um Perfil)
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

// Listar todos os Projetos
app.get('/projects', async (req, res) => {
  const projects = await prisma.project.findMany({
    include: { profile: true, feedbacks: true, technologies: true }
  });
  return res.json(projects);
});

// ==========================================
// 3. ROTAS DE TECNOLOGIA (TECHNOLOGY)
// ==========================================

// Criar Tecnologia
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

// Listar Tecnologias
app.get('/technologies', async (req, res) => {
  const technologies = await prisma.technology.findMany();
  return res.json(technologies);
});

// ==========================================
// 4. ROTAS DE FEEDBACK (FEEDBACK)
// ==========================================

// Criar Feedback para um Projeto
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

// Iniciar o Servidor na porta 3000
app.listen(3000, () => {
  console.log('Servidor DevShowcase rodando em http://localhost:3000');
});