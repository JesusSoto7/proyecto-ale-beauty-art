import React from "react";
import "../../assets/stylesheets/Categoria.css"; // Importamos el CSS

const users = [
  { id: 1, name: "Michael Holz", avatar: "/examples/images/avatar/1.jpg", date: "04/10/2013", role: "Admin", status: "Active", statusColor: "text-success" },
  { id: 2, name: "Paula Wilson", avatar: "/examples/images/avatar/2.jpg", date: "05/08/2014", role: "Publisher", status: "Active", statusColor: "text-success" },
  { id: 3, name: "Antonio Moreno", avatar: "/examples/images/avatar/3.jpg", date: "11/05/2015", role: "Publisher", status: "Suspended", statusColor: "text-danger" },
  { id: 4, name: "Mary Saveley", avatar: "/examples/images/avatar/4.jpg", date: "06/09/2016", role: "Reviewer", status: "Active", statusColor: "text-success" },
  { id: 5, name: "Martin Sommer", avatar: "/examples/images/avatar/5.jpg", date: "12/08/2017", role: "Moderator", status: "Inactive", statusColor: "text-warning" },
];

const Categorias = () => {
  return (
    <div className="container">
      <div className="table-responsive">
        <div className="table-wrapper">
          <div className="table-title">
            <div className="row">
              <div className="col-xs-5">
                <h2>User <b>Management</b></h2>
              </div>
              <div className="col-xs-7">
                <button className="btn btn-primary"><i className="material-icons">&#xE147;</i> <span>Add New User</span></button>
                <button className="btn btn-primary"><i className="material-icons">&#xE24D;</i> <span>Export to Excel</span></button>
              </div>
            </div>
          </div>

          <table className="table table-striped table-hover">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Date Created</th>
                <th>Role</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>
                    <a href="#">
                      <img src={user.avatar} className="avatar" alt="Avatar" /> {user.name}
                    </a>
                  </td>
                  <td>{user.date}</td>
                  <td>{user.role}</td>
                  <td>
                    <span className={`status ${user.statusColor}`}>&bull;</span> {user.status}
                  </td>
                  <td>
                    <a href="#" className="settings" title="Settings"><i className="material-icons">&#xE8B8;</i></a>
                    <a href="#" className="delete" title="Delete"><i className="material-icons">&#xE5C9;</i></a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="clearfix">
            <div className="hint-text">Showing <b>5</b> out of <b>25</b> entries</div>
            <ul className="pagination">
              <li className="page-item disabled"><a href="#">Previous</a></li>
              {[1, 2, 3, 4, 5].map(num => (
                <li key={num} className={`page-item ${num === 3 ? "active" : ""}`}><a href="#" className="page-link">{num}</a></li>
              ))}
              <li className="page-item"><a href="#">Next</a></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Categorias;
