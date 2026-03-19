// main.js

document.addEventListener('DOMContentLoaded', () => {

    // --- Smooth Scrolling ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
                // Cerramos menu movil si está abierto
                if (navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                }
            }
        });
    });

    // --- Highlight Active Nav Link ---
    let currentPath = window.location.pathname.split('/').pop();
    if (currentPath === '') currentPath = 'index.html';

    const navAnchors = document.querySelectorAll('.nav-links a');
    navAnchors.forEach(a => {
        const hrefPath = a.getAttribute('href')?.split('/').pop() || '';

        // Remove style to clear hardcoded ones
        if (!a.classList.contains('btn-primary')) {
            a.removeAttribute('style');
        }

        if (hrefPath === currentPath) {
            if (!a.classList.contains('btn-primary')) {
                a.style.color = 'var(--color-pink)';
                a.style.fontWeight = '700';
            }
        }
    });

    // --- Mobile Menu Toggle ---
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (menuBtn) {
        menuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            // Cambiar icono
            const icon = menuBtn.querySelector('i');
            if (navLinks.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }

    // --- Sticky Navbar Effect ---
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
        } else {
            navbar.style.boxShadow = '0 4px 6px rgba(0,0,0,0.05)';
        }
    });

    // --- FAQ Accordion ---
    const accordionHeaders = document.querySelectorAll('.accordion-header');

    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const item = header.parentElement;
            const content = item.querySelector('.accordion-content');
            const isActive = item.classList.contains('active');

            // Close all
            document.querySelectorAll('.accordion-item').forEach(accItem => {
                accItem.classList.remove('active');
                accItem.querySelector('.accordion-content').style.maxHeight = null;
                accItem.querySelector('.icon').innerHTML = '+';
            });

            // Open clicked if it wasn't active
            if (!isActive) {
                item.classList.add('active');
                content.style.maxHeight = content.scrollHeight + "px";
                item.querySelector('.icon').innerHTML = '×';
            }
        });
    });

    // --- Auto-scroll Testimonials (CSS Infinite Loop Setup) ---
    const tracks = document.querySelectorAll('.testimonials-track');

    // Clonamos el contenido de cada track para que el loop infinito en CSS sea suave y sin cortes
    tracks.forEach(track => {
        const content = track.innerHTML;
        // Agregamos el mismo contenido una vez más
        track.innerHTML = content + content;
    });

    // --- Counter Animation ---
    const counters = document.querySelectorAll('.counter');
    const speed = 200; // Velocidad de la animación

    const startCounters = () => {
        counters.forEach(counter => {
            const updateCount = () => {
                const target = +counter.getAttribute('data-target');
                const count = +counter.innerText;

                // El incremento depende del target para que se vean dinámicos
                const inc = target / speed;

                if (count < target) {
                    counter.innerText = Math.ceil(count + inc);
                    setTimeout(updateCount, 15);
                } else {
                    counter.innerText = target;
                }
            };
            updateCount();
        });
    };

    const observerOptions = {
        threshold: 0.5
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                startCounters();
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const statsSection = document.querySelector('.stats-section');
    if (statsSection) {
        observer.observe(statsSection);
    }

    // --- Aviso de Privacidad Modal ---
    const privacyPolicyHTML = `
    <div id="privacy-modal" class="modal-overlay">
        <div class="modal-content">
            <button class="modal-close">&times;</button>
            <h2 class="modal-title">AVISO DE PRIVACIDAD INTEGRAL DE NANNYS Y PEQUES</h2>
            <div class="modal-body">
                <p>En cumplimiento de la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (en adelante, la "LFPDPPP") y su Reglamento: ponemos a tu disposición este Aviso de Privacidad (el "Aviso de Privacidad"), dirigido a todas aquellas personas físicas y/o empresas (en adelante e indistintamente, titular de los datos) que interactúan con NANNYS Y PEQUES, en los sucesivo y para efectos del presente conocido como NANNYS Y PEQUES.</p>
                <p>Este aviso de privacidad está dirigido a mayores de 18 años.</p>
                <p>Aquí encontrará información sobre el tipo de información que podemos recabar, las finalidades para las que podremos usar su información, con quiénes podremos compartirla, así como los derechos que puede hacer valer para controlar sus datos personales.</p>
                
                <h3>¿QUIÉN ES EL RESPONSABLE DE SUS DATOS?</h3>
                <p>NANNYS Y PEQUES es la entidad Responsable de tus datos personales. Nuestro domicilio para oír y recibir notificaciones es: 16 de septiembre #8908 colonia 16 de septiembre sur. 72574, Puebla, Puebla.</p>
                
                <h3>¿QUÉ DATOS PERSONALES PODEMOS RECABAR?</h3>
                <p>Para las finalidades señaladas en este aviso de privacidad, podremos recabar los siguientes datos personales:</p>
                <ul>
                    <li><strong>Datos de identificación:</strong> nombre, domicilio, teléfono, correo electrónico, entre otros.</li>
                    <li><strong>Datos personales:</strong> ficha médica y datos de estado de salud.</li>
                    <li><strong>Datos financieros y patrimoniales:</strong> número de cuenta bancaria, CLABE, RFC.</li>
                </ul>
                <p>NANNYS Y PEQUES dada la actividad comercial a la que se dedica requiere datos de menores de edad, mismos que se encuentran protegidos por medio de este Aviso de Privacidad.</p>
                
                <h3>¿CÓMO OBTENEMOS TUS DATOS PERSONALES?</h3>
                <p>Los titulares de los datos podrán proporcionar sus datos de forma directa o personal, a través de diversos canales electrónicos o digitales, como las redes sociales o aplicaciones de NANNYS Y PEQUES, o de forma presencial al momento de solicitar un servicio.</p>
                
                <h3>¿PARA QUÉ USAREMOS TUS DATOS PERSONALES?</h3>
                <p>Para servicios de niñera y/o el desarrollo de nuestras actividades enfocadas en el desarrollo infantil.</p>
                <p>NANNYS Y PEQUES podrá utilizar los datos personales que recabamos de usted, serán utilizados para las siguientes finalidades que son necesarias para el servicio que solicita:</p>
                <ul>
                    <li>Elaboración de contratos de prestación de servicios.</li>
                    <li>Facturación y cobro de servicios.</li>
                    <li>Cumplimiento de obligaciones legales y reglamentarias de la materia.</li>
                    <li>Responder a solicitudes de autoridades competentes.</li>
                    <li>La correcta prestación del servicio de cuidado infantil.</li>
                </ul>
                <p>Además, utilizaremos sus datos personales para las siguientes finalidades secundarias que no son necesarias para el servicio solicitado, pero que nos permiten brindarle una mejor atención:</p>
                <ul>
                    <li>Envío de información promocional sobre nuestros servicios.</li>
                    <li>Encuestas de satisfacción del cliente.</li>
                    <li>Estadísticas y análisis de mercado.</li>
                </ul>

                <h3>¿CON QUIÉN PODREMOS COMPARTIR TUS DATOS?</h3>
                <p>Sus datos personales pueden ser transferidos y tratados por personas distintas al responsable, tanto en el territorio mexicano como fuera de él, en los siguientes supuestos:</p>
                <p>Organismos públicos; autoridades federales, estatales o municipales; comisiones; institutos, entidades reguladoras y/o autoridades judiciales para el cumplimiento de obligaciones informativas o para el cumplimiento de requerimientos judiciales o administrativos emitidos por autoridades competentes.</p>
                <p>Las transferencias antes indicadas podrán ser efectuadas sin el consentimiento de los titulares, de acuerdo con el artículo 37 de la LFPDPPP.</p>
                
                <h3>DERECHOS ARCO</h3>
                <p>Como titular de tus datos personales, tienes derecho a ejercer tus derechos de acceso, rectificación, cancelación u oposición (los llamados "Derechos ARCO"). Ten presente que estos derechos ARCO comprenden:</p>
                <ul>
                    <li><strong>Acceso:</strong> el derecho que tienes a conocer qué datos tenemos de ti, así como para saber cómo los usamos o compartimos.</li>
                    <li><strong>Rectificación:</strong> el derecho que tienes para solicitar en todo momento la rectificación de tus datos, si por cualquier motivo están incorrectos, inexactos o incompletos en nuestras bases de datos.</li>
                    <li><strong>Cancelación:</strong> el derecho a pedir que eliminemos tu información, a partir de su bloqueo y su posterior supresión definitiva.</li>
                    <li><strong>Oposición:</strong> el derecho que tienes a indicar una causa legítima por la cual debemos dejar de usar tus datos personales.</li>
                </ul>
                <p>Para ejercer cualquiera de tus Derechos ARCO podrás presentar una solicitud dirigiendo un correo electrónico a la cuenta: nannysypeques@gmail.com o en el siguiente domicilio del titular ya señalado.</p>
                <p>Tu solicitud deberá incluir:</p>
                <ul>
                    <li>Tu nombre y domicilio completos, u otro medio para comunicar la respuesta a tu solicitud.</li>
                    <li>Copia de un documento que acredite tu identidad, y en su caso, la representación legal si alguien ejerce el derecho en su nombre.</li>
                    <li>Una descripción clara y precisa del derecho ARCO que deseas ejercer y de los datos personales relacionados con tu solicitud; y</li>
                    <li>En su caso, cualquier otra información o documento que nos ayude a localizar tus datos personales.</li>
                </ul>
                <p>NANNYS Y PEQUES responderá a tu solicitud dentro de los 20 (veinte) días hábiles siguientes a la fecha en que sea enviada y recibida. Si la solicitud resulta procedente, la haremos efectiva dentro de los 15 (quince) días hábiles siguientes a la fecha en que comuniquemos nuestra respuesta. En caso de que la información y/o documentación proporcionada en tu solicitud resulten incompletas, erróneas y/o insuficientes, o bien, no se acompañen los documentos necesarios para acreditar tu identidad o la representación legal correspondiente, solicitaremos la corrección y subsanación de las deficiencias para poder dar trámite a la misma. Contarás con 10 (diez) días hábiles para atender el requerimiento y corrección de la solicitud; en caso contrario ésta se tendrá por no presentada.</p>
                <p>Por favor, toma en cuenta que los Derechos ARCO no son absolutos y podrán ser parcial o totalmente improcedentes en determinados casos. En todos los casos, NANNYS Y PEQUES expone las razones y motivos de sus determinaciones.</p>

                <h3>¿QUIERES REVOCAR TU CONSENTIMIENTO?</h3>
                <p>En algunos casos, puedes revocar el consentimiento para el tratamiento de tus datos personales; sin embargo, esta revocación no puede tener efectos retroactivos, es decir, no puede afectar a situaciones, trámites realizados antes de la revocación de tu consentimiento.</p>
                <p>Tome en cuenta que pueden existir disposiciones de orden público que nos obliguen a conservar tu información durante un mínimo legal; en tales casos, sólo conservaremos tu información para cumplir con esas disposiciones legales.</p>
                
                <h3>CAMBIOS A ESTE AVISO DE PRIVACIDAD</h3>
                <p>Nos reservamos el derecho de modificar, actualizar, extender y/o de cualquier otra forma cambiar el contenido y alcance de este Aviso de Privacidad, en cualquier momento y bajo completa discreción de NANNYS Y PEQUES; en tales casos, publicaremos dichos avisos en página web oficial de NANNYS Y PEQUES.</p>
                
                <h3>CONSENTIMIENTO</h3>
                <p>Al proporcionar sus datos personales, usted consiente su tratamiento conforme a lo dispuesto en este aviso de privacidad.</p>

                <hr style="margin: 2rem 0; border: none; border-top: 1px solid #ccc;">

                <p>Se pone a su disposición, la ficha médica que se requisita cuando usted contrata un servicio con NANNYS Y PEQUES.</p>
                
                <h4 style="margin-top: 1.5rem;">DATOS GENERALES DE LA NIÑA O NIÑO</h4>
                <p>NOMBRE COMPLETO: _________________________________________</p>
                <p>FECHA DE NACIMIENTO: _______________________________________</p>
                <p>EDAD: ____________ SEXO: ____________</p>

                <h4 style="margin-top: 1.5rem;">DATOS GENERALES DE LOS PROGENITORES</h4>
                <p>NOMBRE COMPLETO DE LOS PADRES: _________________________________________</p>
                <p>TELÉFONO DE CONTACTO: _________________________________________</p>
                <p>TELÉFONO ALTERNO EN CASO DE EMERGENCIA: _________________________________________</p>
                <p>PARENTESCO DEL CONTACTO ALTERNO: _________________________________________</p>

                <h4 style="margin-top: 1.5rem;">INFORMACIÓN MÉDICA DE LA NIÑA O NIÑO</h4>
                <p>TIPO DE SANGRE: _________________</p>
                <p>ALERGIAS A ALIMENTOS, MEDICAMENTOS O INSECTOS ESPECIFICAR: _________________________________________</p>
                <p>¿PADECE ALGUNA ENFERMEDAD CRÓNICA O CONDICIÓN ESPECIAL? ESPECIFICAR: _________________________________________</p>
                <p>¿TOMA MEDICAMENTOS DE FORMA REGULAR?: _________________________________________</p>
                <p>¿TIENE ALGUNA RESTRICCIÓN FÍSICA O INDICACIÓN ESPECIAL PARA SU CUIDADO?: _________________________________________</p>

                <h4 style="margin-top: 1.5rem;">AUTORIZACIÓN</h4>
                <p>Fecha: ____ / ____ / ______</p>
                <p>Yo, ________________________________________________________, padre, madre o tutor legal del menor mencionado, autorizo al personal del servicio de niñeras a brindar los primeros auxilios básicos en caso de accidente o malestar, así como a comunicarse inmediatamente conmigo o con el contacto de emergencia en caso necesario.</p>
                <p>FIRMA DEL PADRE/MADRE O TUTOR: _________________________________________________</p>
            </div>
        </div>
    </div>
    `;

    document.body.insertAdjacentHTML('beforeend', privacyPolicyHTML);

    const privacyModal = document.getElementById('privacy-modal');
    const privacyLinks = document.querySelectorAll('.aviso-privacidad-link');
    const closeBtn = document.querySelector('.modal-close');

    privacyLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            privacyModal.classList.add('active');
            document.body.style.overflow = 'hidden'; // Evitar scroll de fondo
        });
    });

    closeBtn.addEventListener('click', () => {
        privacyModal.classList.remove('active');
        document.body.style.overflow = 'auto';
    });

    privacyModal.addEventListener('click', (e) => {
        if (e.target === privacyModal) {
            privacyModal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    });

    // --- Contact Form to WhatsApp ---
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault(); // Evita recargar la página

            const nombre = document.getElementById('nombreContacto').value.trim();
            const ciudad = document.getElementById('ciudadContacto').value.trim();
            const edad = document.getElementById('edadContacto').value.trim();
            const busqueda = document.getElementById('busquedaContacto').value.trim();

            const mensaje = `Hola soy ${nombre}, escribo de la ciudad de ${ciudad} y mi peque tiene ${edad} y estoy buscando ${busqueda}`;

            // Número especificado: 222 402 1886 (código país 52)
            const telefono = '522224021886';
            const whatsappUrl = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;

            window.open(whatsappUrl, '_blank');
        });
    }

    // --- Floating WhatsApp Button ---
    const floatWAPhone = '522224021886';
    const floatWAMsg = 'Hola, quisiera encontrar a mi nanny ideal';
    const floatWAUrl = `https://wa.me/${floatWAPhone}?text=${encodeURIComponent(floatWAMsg)}`;

    const floatBtnHTML = `
        <a href="${floatWAUrl}" target="_blank" class="float-whatsapp">
            <i class="fab fa-whatsapp"></i>
            <span class="float-whatsapp-text">¿Cómo podemos ayudarte?</span>
        </a>
    `;
    document.body.insertAdjacentHTML('beforeend', floatBtnHTML);
});
