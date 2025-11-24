import React, { useEffect, useState } from 'react';
import "../assets/stylesheets/SupportMs.css";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import TwitterIcon from "@mui/icons-material/Twitter";
import PinterestIcon from "@mui/icons-material/Pinterest";


export default function SupportMs() {

    const [orders, setOrders] = useState([]);
    const [orderId, setOrderId] = useState("");
    const [loadingOrders, setloadingOrders] = useState(true);
    const [message_text, setMessageText] = useState("");
    const token = localStorage.getItem("token");


    // Cargar órdenes
    useEffect(() => {
    fetch("https://localhost:4000/api/v1/my_orders", {
        headers: { "Authorization": `Bearer ${token}` }
    })
        .then(res => res.json())
        .then(data => {
        if (Array.isArray(data)) {
            setOrders(data);
        } else if (Array.isArray(data.orders)) {
            setOrders(data.orders);
        } else {
            setOrders([]);
        }
        })
        .catch(err => console.error("Error cargando órdenes:", err))
        .finally(() => setloadingOrders(false));
    }, [token]);


    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!orderId) {
            alert("Seleccione una orden antes de enviar.");
            return;
        }


        const payload = {
            support_message: {
                order_id: Number(orderId),
                message_text
            }
        };

        console.log("Payload enviado:", payload);

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

                <article className='email-number' style={{display:"flex", gap: 150}}>
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
                    style={{ background: "#f8f9f9", height: 45, border: "none", borderRadius: 10, padding: 9 }}
                    >
                    <option value="">Seleccione número de orden</option>

                    {orders.map(order => (
                        <option key={order.id} value={order.id}>
                        {order.numero_de_orden} — {order.status}
                        </option>
                    ))}
                </select>


            <textarea
                placeholder="Tu mensaje*"
                value={message_text}
                onChange={(e) => setMessageText(e.target.value)}
                rows="10"
                style={{ background: "#f8f9f9" }}
            ></textarea>

            <button type="submit" className="send-btn">
                enviar comentario
            </button>

            </form>
        </div>

        </div>
    );
}
