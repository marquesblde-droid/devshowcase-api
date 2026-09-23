const express = require('express');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

// Rota inicial de teste
app.get('/', (req, res) => {
  return res.json({ message: 'API DevShowcase funcionando perfeitamente!' });
});

// PROFILES
app.post('/api/profiles', async (req, res, next) => {
  try {
    const { name, email, bio } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'Nome e e-mail são obrigatórios.' });
    }
    const profile = await prisma.profile.create({
      data: { name, email, bio }
    });
    return res.status(201).json(profile);
  } catch (error) {
    return res.status(400).json({ error: 'Erro ao criar perfil ou e-mail já cadastrado.' });
  }
});

app.get('/api/profiles', async (req, res) => {
  const profiles = await prisma.profile.findMany({
    include: { projects: true }
  });
  return res.json(profiles);
});

// PROJECTS
app.post('/api/projects', async (req, res) => {
  try {
    const { title, description, url, profileId } = req.body;
    if (!title || !description || !profileId) {
      return res.status(400).json({ error: 'Título, descrição e profileId são obrigatórios.' });
    }
    const project = await prisma.project.create({
      data: { title, description, url, profileId }
    });
    return res.status(201).json(project);
  } catch (error) {
    return res.status(400).json({ error: 'Erro ao criar projeto. Verifique o profileId.' });
  }
});

// 1. REQUISITO 1: GET /api/projects (Com filtro por tecnologia e paginação)
app.get('/api/projects', async (req, res) => {
  try {
    const { tech, page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const projects = await prisma.project.findMany({
      where: tech ? {
        technologies: {
          some: { name: { contains: tech, mode: 'insensitive' } }
        }
      } : {},
      skip: skip,
      take: Number(limit),
      include: { profile: true, feedbacks: true, technologies: true }
    });
    return res.json(projects);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao buscar projetos.' });
  }
});


app.post('/api/projects/:id/feedbacks', async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    // Validação de erro 400 (Bad Request)
    if (!rating || rating < 1 || rating > 5 || !comment) {
      return res.status(400).json({ error: 'A nota deve ser entre 1 e 5 e o comentário é obrigatório.' });
    }

    // Verificar se o projeto existe (Erro 404)
    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) {
      return res.status(404).json({ error: 'Projeto não encontrado.' });
    }

    // Cadastrar o feedback
    await prisma.feedback.create({
      data: { rating: Number(rating), comment, projectId: id }
    });

    // Recalcular a nota média
    const feedbacks = await prisma.feedback.findMany({ where: { projectId: id } });
    const totalRating = feedbacks.reduce((acc, f) => acc + f.rating, 0);
    const averageRating = totalRating / feedbacks.length;

    // Atualizar projeto com a nova média
    const updatedProject = await prisma.project.update({
      where: { id },
      data: { averageRating }
    });

    return res.status(201).json(updatedProject);
  } catch (error) {
    return res.status(400).json({ error: 'Erro ao processar feedback.' });
  }
});


app.put('/api/projects/:id/upvote', async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se o projeto existe (Erro 404)
    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) {
      return res.status(404).json({ error: 'Projeto não encontrado.' });
    }

    // Incrementar upvotes em +1
    const updatedProject = await prisma.project.update({
      where: { id },
      data: { upvotes: { increment: 1 } }
    });

    return res.json(updatedProject);
  } catch (error) {
    return res.status(400).json({ error: 'Erro ao dar upvote.' });
  }
});

// TECHNOLOGIES
app.post('/api/technologies', async (req, res) => {
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

app.get('/api/technologies', async (req, res) => {
  const technologies = await prisma.technology.findMany();
  return res.json(technologies);
});

// TRATAMENTO GLOBAL DE ROTA NÃO ENCONTRADA (404)
app.use((req, res) => {
  return res.status(404).json({ error: 'Rota não encontrada.' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor DevShowcase rodando na porta ${PORT}`);
});