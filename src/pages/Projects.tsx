import { projects } from "../data/mockData";

function Projects() {
  return (
    <section className="page-section">
      <div className="section-header">
        <div>
          <p className="eyebrow">Production</p>
          <h3>Projects</h3>
        </div>

        <button className="primary-btn">New Project</button>
      </div>

      <div className="project-grid">
        {projects.map((project) => (
          <div className="project-card" key={project.id}>
            <span className="status-pill">{project.priority}</span>
            <h4>{project.title}</h4>
            <p>{project.type}</p>

            <div className="progress-bar">
              <div className="progress-fill"></div>
            </div>

            <small>{project.status}</small>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Projects;