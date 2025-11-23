import React, { useEffect, useState } from 'react';
import "../assets/stylesheets/SupportMs.css";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import TwitterIcon from "@mui/icons-material/Twitter";
import PinterestIcon from "@mui/icons-material/Pinterest";


export default function SupportMs() {

    const [orders, setOrders] = useState([]);
    const [orderId, setOrderId] = useState("");
    const [message_text, setMessageText] = useState("");
    const token = localStorage.getItem("token");

    // Cargar órdenes
    useEffect(() => {
        fetch("https://localhost:4000/api/v1/orders", {
        headers: { "Authorization": `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => setOrders(data.orders || []))
        .catch(err => console.error("Error cargando órdenes:", err));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = {
        support_message: {
            order_id: orderId,
            message_text
        }
        };

        const res = await fetch("https://localhost:4000/api/v1/support_messages", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
        });

        const data = await res.json();
        alert(data.message || "Enviado correctamente");
    };


    return (
        <div className="support-container">
        {/* Left side info */}
            <div className="support-info" >

                <h1 className="title-touch">Contacta con nosotros</h1>
                <p className="subtitle-touch" style={{width: "500px", marginLeft: "15px",color: "#a9a9a9", fontWeight: "bold"}}>
                    si tienes alguna duda o inconveniente, no dudes en contactarnos a través del siguiente formulario o por medio de nuestros canales de atención. 
                    Estamos aquí para ayudarte y brindarte el mejor servicio posible.
                </p>

                <article style={{display:"flex", gap: 150}}>
                <div className="info-block">
                        <p className="label">Email:</p>
                        <p className="value">soporte.alebeauty@gmail.com</p>
                    </div>

                    <div className="info-block">
                        <p className="label">Telefono:</p>
                        <p className="value">+57 302 2880520</p>
                    </div> 
                </article>
                

                <div className="info-block">
                    <p className="label">Address:</p>
                    <p className="value" style={{width: "500px"}}>
                    Atlantico, Rebolo, Cra 29 #17-17 <br />
                    Colombia
                    </p>
                </div>

                <div className="social-section">
                    <p className="label">Follow us</p>

                    <div className="social-icons">
                    <a href="https://www.instagram.com/ale.beautyart/" style={{background:"none"}} >
                        <div className="circle" ><InstagramIcon/></div>
                    </a>
                    
                    <a href="" style={{background:"none"}} >
                        <div className="circle" ><FacebookIcon/></div>
                    </a>
                    <a href="" style={{background:"none"}} >
                        <div className="circle" ><PinterestIcon/></div>
                    </a>
                    <a href="" style={{background:"none"}} >
                        <div className="circle" ><TwitterIcon/></div>
                    </a>
                    </div>
                </div>

            </div>


        {/* Right side form */}
        <div className="support-form-container">
            <form className="support-form" onSubmit={handleSubmit}>
            
            <select
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                className="full-width"
                style={{ background: "#e0f4ff", padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
            >
                <option value="">Selecciona tu número de orden*</option>
                {orders.map(order => (
                <option key={order.id} value={order.id}>
                    {order.numero_de_orden} — ${order.pago_total}
                </option>
                ))}
            </select>

            <textarea
                placeholder="Tu mensaje*"
                value={message_text}
                onChange={(e) => setMessageText(e.target.value)}
                rows="10"
                style={{ background: "#e0f4ff" }}
            ></textarea>

            <button type="submit" className="send-btn">
                Send message
            </button>

            </form>
        </div>

        </div>
    );
}
