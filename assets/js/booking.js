document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("bookingForm");
    const successBox = document.getElementById("successBox");

    const eventType = document.getElementById("eventType");
    const otherWrap = document.getElementById("otherEventWrap");
    const eventOther = document.getElementById("eventOther");

    const serviceType = document.getElementById("serviceType");
    const videoSection = document.getElementById("videoSection");

    const videoType = document.getElementById("videoType");
    const videoDuration = document.getElementById("videoDuration");
    const videoFormat = document.getElementById("videoFormat");
    const usage = document.getElementById("usage");

    const eventDate = document.getElementById("eventDate");
    const eventTime = document.getElementById("eventTime");


    function setMinDateToday() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, "0");
        const dd = String(today.getDate()).padStart(2, "0");

        eventDate.min = `${yyyy}-${mm}-${dd}`;
    }

    function validateEventDate() {
        if (!eventDate.value) {
            eventDate.setCustomValidity("");
            return;
        }

        if (eventDate.value < eventDate.min) {
            eventDate.setCustomValidity("Please choose today or a future date.");
        } else {
            eventDate.setCustomValidity("");
        }
    }

    setMinDateToday();
    eventDate.addEventListener("change", validateEventDate);


    function validateEventTime() {
        const value = (eventTime.value || "").trim();

        if (!value) {
            eventTime.setCustomValidity("");
            return;
        }

        const match = value.match(/^(\d{2}):(\d{2})$/);
        if (!match) {
            eventTime.setCustomValidity("Please use HH:MM (00:00–23:59).");
            return;
        }

        const hours = Number(match[1]);
        const minutes = Number(match[2]);

        if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
            eventTime.setCustomValidity("Please enter a valid time (00:00–23:59).");
        } else {
            eventTime.setCustomValidity("");
        }
    }

    eventTime.addEventListener("input", validateEventTime);
    eventTime.addEventListener("blur", validateEventTime);


    eventType.addEventListener("change", () => {
        const isOther = eventType.value === "Other";
        otherWrap.classList.toggle("d-none", !isOther);
        eventOther.required = isOther;

        if (!isOther) {
            eventOther.value = "";
            eventOther.setCustomValidity("");
        }
    });


    function toggleVideoSection() {
        const value = serviceType.value;
        const show = value === "Videography" || value === "Both";

        videoSection.classList.toggle("d-none", !show);

        if (!show) {
            videoType.value = "";
            videoDuration.value = "";
            videoFormat.value = "";
            usage.value = "";
        }
    }

    serviceType.addEventListener("change", toggleVideoSection);
    toggleVideoSection();


    form.addEventListener("submit", (e) => {
        e.preventDefault();
        successBox.classList.remove("show");

        setMinDateToday();

        validateEventDate();
        validateEventTime();

        if (!form.checkValidity()) {
            form.classList.add("was-validated");
            return;
        }

        const isOther = form.eventType.value === "Other";
        const finalEventType = isOther
            ? (eventOther.value.trim() || "Other")
            : form.eventType.value;

        const showVideo = form.serviceType.value === "Videography" || form.serviceType.value === "Both";

        const lines = [
            `Full name: ${form.clientName.value.trim()}`,
            `Client email: ${form.clientEmail.value.trim()}`,
            `Phone: ${form.clientPhone.value.trim()}`,
            ``,
            `Service: ${form.serviceType.value}`,
            `Event: ${finalEventType}`,
            `City: ${form.city.value.trim()}`,
            `Venue: ${form.venue.value.trim() || "-"}`,
            `Date: ${form.eventDate.value}`,
            `Start time: ${(form.eventTime.value || "").trim()}`,
            `Coverage (hours): ${form.coverageHours.value}`,
        ];

        if (showVideo) {
            lines.push(
                ``,
                `--- Video ---`,
                `Video type: ${videoType.value || "-"}`,
                `Video duration: ${videoDuration.value.trim() || "-"}`,
                `Format: ${videoFormat.value || "-"}`,
                `Usage: ${usage.value || "-"}`
            );
        }

        lines.push(
            ``,
            `Notes: ${form.notes.value.trim() || "-"}`
        );

        const to = "click.n.clips9@gmail.com";
        const subject = `Booking request - ${form.clientName.value.trim()} (${form.eventDate.value})`;
        const body = lines.join("\n");

        const mailto =
            `mailto:${encodeURIComponent(to)}` +
            `?subject=${encodeURIComponent(subject)}` +
            `&body=${encodeURIComponent(body)}`;


        successBox.classList.add("show");
        successBox.scrollIntoView({ behavior: "smooth", block: "center" });


        form.reset();
        form.classList.remove("was-validated");
        otherWrap.classList.add("d-none");
        eventOther.required = false;
        toggleVideoSection();
        setMinDateToday();
        eventDate.setCustomValidity("");
        eventTime.setCustomValidity("");


        setTimeout(() => {
            window.location.href = mailto;
        }, 300);
    });
});