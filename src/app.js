// Validate the fields array and return an error message if invalid, otherwise null
function getFieldsValidationError(fields) {
    if (!Array.isArray(fields) || fields.length === 0) return 'Please add at least one form field.';
    for (const field of fields) {
        if (typeof field.label !== 'string' || typeof field.type !== 'string' || typeof field.key !== 'string') return 'Each field must have label, type, and key as strings.';
        if ((field.type === 'select' || field.type === 'radio') && !Array.isArray(field.options)) return 'Select and radio fields must have an options array.';
    }
    return null;
}

// Generic input element creator
function createInputElement(type, field) {
    const input = document.createElement('input');
    input.type = type;
    input.id = field.key;
    input.name = field.key;
    if (field.required) input.required = true;
    if (field.placeholder) input.placeholder = field.placeholder;
    if (field.value !== undefined) input.value = field.value;
    return input;
}

// Field renderer registry for extensibility
const fieldRenderers = {
    text: (field) => createInputElement('text', field),
    number: (field) => createInputElement('number', field),
    select: (field) => {
        const select = document.createElement('select');
        select.id = field.key;
        select.name = field.key;
        field.options.forEach(opt => {
            const option = document.createElement('option');
            option.value = opt;
            option.textContent = opt;
            select.appendChild(option);
        });
        return select;
    },
    radio: (field) => {
        const radioGroup = document.createElement('div');
        field.options.forEach(opt => {
            const radio = document.createElement('input');
            radio.type = 'radio';
            radio.name = field.key;
            radio.value = opt;
            radio.id = field.key + '_' + opt;
            const radioLabel = document.createElement('label');
            radioLabel.textContent = opt;
            radioLabel.htmlFor = radio.id;
            radioGroup.appendChild(radio);
            radioGroup.appendChild(radioLabel);
        });
        return radioGroup;
    }
    // Add more field types here as needed
};

function renderElements(config, container) {
    container.innerHTML = '';
    const form = document.createElement('form');
    form.id = 'dynamic-form';
    if (config.formAction) form.action = config.formAction;
    const fieldsWrapper = document.createElement('div');
    fieldsWrapper.className = 'form-fields-wrapper';
    config.fields.forEach(field => {
        const wrapper = document.createElement('div');
        wrapper.className = 'form-field-row';
        const label = document.createElement('label');
        label.textContent = field.label + (field.required ? ' *' : '');
        label.htmlFor = field.key;
        wrapper.appendChild(label);
        let input = fieldRenderers[field.type] ? fieldRenderers[field.type](field) : null;
        if (input) wrapper.appendChild(input);
        fieldsWrapper.appendChild(wrapper);
    });
    form.appendChild(fieldsWrapper);
    const submitBtn = document.createElement('button');
    submitBtn.type = 'submit';
    submitBtn.textContent = 'Submit';
    form.appendChild(submitBtn);
    form.onsubmit = function(e) {
        e.preventDefault();
        const data = {};
        config.fields.forEach(field => {
            if (field.type === 'radio') {
                const checked = form.querySelector(`input[name='${field.key}']:checked`);
                data[field.key] = checked ? checked.value : '';
            } else {
                data[field.key] = form.elements[field.key].value;
            }
        });
        const payloadArea = document.getElementById('api-payload');
        const label = document.getElementById('api-call-label');
        if (payloadArea) {
            payloadArea.value = JSON.stringify(data, null, 2);
            payloadArea.style.display = 'block';
        }
        if (label) label.style.display = 'block';
    };
    container.appendChild(form);
}

document.addEventListener('DOMContentLoaded', function() {
    const jsonInput = document.getElementById('json-input');
    const rendered = document.getElementById('rendered-elements');
    const apiPayload = document.getElementById('api-payload');
    // Default config
    const defaultConfig = {
        formAction: "https://api.example.com/submit",
        fields: [
            { label: "Name", type: "text", key: "name", required: true },
            { label: "Age", type: "number", key: "age", required: false },
            { label: "Gender", type: "select", key: "gender", options: ["Male", "Female"] },
            { label: "Subscription", type: "radio", key: "subscription", options: ["Free", "Premium", "Enterprise"], required: true }
        ]
    };
    jsonInput.value = JSON.stringify(defaultConfig, null, 2);

    function tryRender() {
        let config;
        const errorLabel = document.getElementById('json-error-label');
        errorLabel.style.display = 'none';
        errorLabel.textContent = '';
        try {
            config = JSON.parse(jsonInput.value);
        } catch (e) {
            rendered.innerHTML = '';
            if (apiPayload) apiPayload.value = '';
            errorLabel.textContent = 'Invalid JSON: ' + e.message;
            errorLabel.style.display = 'block';
            return;
        }
        if (typeof config !== 'object' || !Array.isArray(config.fields)) {
            rendered.innerHTML = '';
            if (apiPayload) apiPayload.value = '';
            errorLabel.textContent = 'JSON must be an object with a "fields" array and optional "formAction" string.';
            errorLabel.style.display = 'block';
            return;
        }
        if (!config.formAction || typeof config.formAction !== 'string' || !/^https?:\/\//.test(config.formAction)) {
            rendered.innerHTML = '';
            if (apiPayload) apiPayload.value = '';
            errorLabel.textContent = 'Form URL should be provided.';
            errorLabel.style.display = 'block';
            return;
        }
        const validationError = getFieldsValidationError(config.fields);
        if (validationError) {
            rendered.innerHTML = '';
            if (apiPayload) apiPayload.value = '';
            errorLabel.textContent = validationError;
            errorLabel.style.display = 'block';
            return;
        }
        errorLabel.style.display = 'none';
        renderElements(config, rendered);
        if (apiPayload) apiPayload.value = '';
    }

    jsonInput.addEventListener('input', tryRender);
    tryRender();
});
