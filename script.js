// Google Apps Script Web App URL
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyW_KF54inHoVjoJ0npSPMTny9PJWLkbjbBEddrSLS9YVQjjSYinzlvLLUp2V9L3ToZ/exec";
// Star Rating Interactivity
document.querySelectorAll('.rating-group').forEach(group => {
    const input = group.querySelector('input');
    const stars = group.querySelectorAll('.star-picker i');
    const ratingText = group.querySelector('.rating-text');

    stars.forEach(star => {
        star.addEventListener('click', () => {
            const val = star.getAttribute('data-value');
            input.value = val;
            ratingText.textContent = `${val}/5`;

            stars.forEach(s => {
                const sVal = s.getAttribute('data-value');
                if (sVal <= val) {
                    s.classList.remove('fa-regular');
                    s.classList.add('fa-solid');
                } else {
                    s.classList.remove('fa-solid');
                    s.classList.add('fa-regular');
                }
            });
        });
    });
});

// Form Submission Handler
const form = document.getElementById('feedbackForm');
const submitBtn = document.getElementById('submitBtn');
const btnText = document.getElementById('btnText');
const btnSpinner = document.getElementById('btnSpinner');
const formError = document.getElementById('form-error');

let generatedData = null;

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    formError.classList.add('hidden');

    const payload = {
        fullName: document.getElementById('fullName').value.trim(),
        email: document.getElementById('email').value.trim(),
        department: document.getElementById('department').value.trim(),
        academicLevel: document.getElementById('academicLevel').value,
        participationCategory: document.getElementById('participationCategory').value,
        role: document.getElementById('role').value,
        overallExperience: document.getElementById('overallExperience').value,
        organization: document.getElementById('organization').value,
        projectQuality: document.getElementById('projectQuality').value,
        venue: document.getElementById('venue').value,
        coordinatorSupport: document.getElementById('coordinatorSupport').value,
        learningOpportunities: document.getElementById('learningOpportunities').value,
        whatLiked: document.getElementById('whatLiked').value.trim(),
        recommendation: document.getElementById('recommendation').value,
        consent: document.getElementById('consent').checked
    };

    if (!payload.consent) {
        showError("Please agree to the consent checkbox before submitting.");
        return;
    }

    submitBtn.disabled = true;
    btnText.textContent = "Submitting...";
    btnSpinner.classList.remove('hidden');

    try {
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8'
            },
            body: JSON.stringify(payload),
            redirect: 'follow'
        });

        const text = await response.text();
        console.log("Raw response from Apps Script:", text);

        const result = JSON.parse(text);

        if (result.status === "success") {
            generatedData = result;
            // Only show certificate if data was actually saved
            showSuccessScreen(payload, result);
        } else {
            // Data NOT saved — show error and keep the form visible
            throw new Error(result.message || "Data was not saved. Please try again.");
        }
    } catch (err) {
        console.error("Submission error:", err);
        showError("Submission failed: " + err.message + " — Please try again.");
        // Form stays visible so user can retry
    } finally {
        submitBtn.disabled = false;
        btnText.textContent = "Submit & Generate Certificate";
        btnSpinner.classList.add('hidden');
    }
});

function showError(msg) {
    formError.textContent = msg;
    formError.classList.remove('hidden');
    formError.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function showSuccessScreen(payload, res) {
    // Hide form, show success + certificate
    document.getElementById('form-container').classList.add('hidden');
    document.getElementById('success-container').classList.remove('hidden');

    document.getElementById('displaySubId').textContent = res.submissionId || "SUB-XXXX";

    // Populate Certificate
    document.getElementById('certName').textContent = payload.fullName;

    window.scrollTo({ top: 200, behavior: 'smooth' });
}

// Download PDF Certificate
document.getElementById('downloadBtn').addEventListener('click', () => {
    const element = document.getElementById('certificateElement');
    const opt = {
        margin: 0.2,
        filename: `Aavishkar_2026_Certificate_${document.getElementById('certName').textContent.replace(/\s+/g, '_')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'landscape' }
    };
    html2pdf().from(element).set(opt).save();
});

// Print Certificate
document.getElementById('printBtn').addEventListener('click', () => {
    window.print();
});

// Reset Form
document.getElementById('resetBtn').addEventListener('click', () => {
    form.reset();

    document.querySelectorAll('.rating-group').forEach(group => {
        const input = group.querySelector('input');
        input.value = 5;
        group.querySelector('.rating-text').textContent = '5/5';
        group.querySelectorAll('.star-picker i').forEach(s => {
            s.classList.remove('fa-regular');
            s.classList.add('fa-solid');
        });
    });

    document.getElementById('success-container').classList.add('hidden');
    document.getElementById('form-container').classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
});