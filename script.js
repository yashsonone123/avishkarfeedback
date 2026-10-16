// ============================================================
// Google Apps Script Web App URL
// ============================================================
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyW_KF54inHoVjoJ0npSPMTny9PJWLkbjbBEddrSLS9YVQjjSYinzlvLLUp2V9L3ToZ/exec";

// ============================================================
// Star Rating Interactivity
// ============================================================
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

// ============================================================
// Element References
// ============================================================
const form = document.getElementById('feedbackForm');
const submitBtn = document.getElementById('submitBtn');
const btnText = document.getElementById('btnText');
const btnSpinner = document.getElementById('btnSpinner');
const formError = document.getElementById('form-error');

let generatedData = null;

// ============================================================
// Form Submission Handler
// ============================================================
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
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(payload),
            redirect: 'follow'
        });

        const text = await response.text();
        console.log("Raw response from Apps Script:", text);

        let result;
        try {
            result = JSON.parse(text);
        } catch (parseErr) {
            throw new Error("Server returned an invalid response. Please try again.");
        }

        if (result.status === "success") {
            generatedData = result;
            showSuccessScreen(payload, result);
        } else {
            throw new Error(result.message || "Data was not saved. Please try again.");
        }
    } catch (err) {
        console.error("Submission error:", err);
        showError("Submission failed: " + err.message + " — Please try again.");
    } finally {
        submitBtn.disabled = false;
        btnText.textContent = "Submit & Generate Certificate";
        btnSpinner.classList.add('hidden');
    }
});

// ============================================================
// Helpers
// ============================================================
function showError(msg) {
    formError.textContent = msg;
    formError.classList.remove('hidden');
    formError.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function showSuccessScreen(payload, res) {
    document.getElementById('form-container').classList.add('hidden');
    document.getElementById('success-container').classList.remove('hidden');
    document.getElementById('displaySubId').textContent = res.submissionId || "SUB-XXXX";
    document.getElementById('certName').textContent = payload.fullName;
    autoFitCertificatePreview();
    window.scrollTo({ top: 200, behavior: 'smooth' });
}

// ============================================================
// Auto-fit certificate preview on small screens
// ============================================================
function autoFitCertificatePreview() {
    const wrapper = document.getElementById('certificateElement').parentElement;
    const cert = document.getElementById('certificateElement');

    const applyScale = () => {
        const availableWidth = wrapper.clientWidth - 16;
        const certWidth = 850;

        if (availableWidth < certWidth) {
            const scale = availableWidth / certWidth;
            cert.style.transform = `scale(${scale})`;
            cert.style.transformOrigin = 'top left';
            wrapper.style.height = (cert.offsetHeight * scale) + 'px';
            wrapper.style.overflow = 'hidden';
        } else {
            cert.style.transform = 'none';
            wrapper.style.height = '';
            wrapper.style.overflow = 'auto';
        }
    };

    applyScale();
    window.addEventListener('resize', applyScale);
}

// ============================================================
// Download PDF (via Print → Save as PDF)
// ============================================================
document.getElementById('printBtn').addEventListener('click', () => {
    const cert = document.getElementById('certificateElement');
    const wrapper = cert.parentElement;

    // Save current inline styles so we can restore
    const prevTransform = cert.style.transform;
    const prevTransformOrigin = cert.style.transformOrigin;
    const prevWrapperHeight = wrapper.style.height;
    const prevWrapperOverflow = wrapper.style.overflow;

    // Reset scale so the full 850px certificate is printed
    cert.style.transform = 'none';
    cert.style.transformOrigin = 'top left';
    wrapper.style.height = 'auto';
    wrapper.style.overflow = 'visible';

    // Give the browser a moment to reflow before opening print dialog
    setTimeout(() => {
        window.print();

        // Restore after print dialog is dismissed
        setTimeout(() => {
            cert.style.transform = prevTransform;
            cert.style.transformOrigin = prevTransformOrigin;
            wrapper.style.height = prevWrapperHeight;
            wrapper.style.overflow = prevWrapperOverflow;
            autoFitCertificatePreview();
        }, 300);
    }, 100);
});

// ============================================================
// Reset Form
// ============================================================
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
    document.getElementById('form-error').classList.add('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
});
