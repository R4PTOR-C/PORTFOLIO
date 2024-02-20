import React from "react";

// Array de objetos representando seus projetos
const Projects = [
    {
        title: "Projeto 1",
        description: "Descrição do Projeto 1.",
        imageUrl: "/caminho/para/imagem1.jpg",
        projectUrl: "https://linkdoprojeto1.com"
    },
    {
        title: "Projeto 2",
        description: "Descrição do Projeto 2.",
        imageUrl: "/caminho/para/imagem2.jpg",
        projectUrl: "https://linkdoprojeto2.com"
    },
    // Adicione mais projetos conforme necessário
];

const ProjectsPage = () => {
    return (
        <div className="container mt-5">
            <div className="row">
                {Projects.map((project, index) => (
                    <div className="col-md-4 mb-4" key={index}>
                        <div className="card">
                            <img src={project.imageUrl} className="card-img-top" alt={project.title} />
                            <div className="card-body">
                                <h5 className="card-title">{project.title}</h5>
                                <p className="card-text">{project.description}</p>
                                <a href={project.projectUrl} className="btn btn-primary" target="_blank" rel="noopener noreferrer">Visitar Site</a>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProjectsPage;
