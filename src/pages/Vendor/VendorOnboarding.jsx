import React, { useState, useEffect, useRef } from 'react';

import {

    Camera,

    Building,

    Utensils,

    Flower2,

    Scissors,

    Flame,

    Music,

    Hand,

    Mail,

    Car,

    Mic,

    PlusCircle,

    ArrowLeft,

    ArrowRight

} from 'lucide-react';

import './VendorOnboarding.css';

// --- Reusable Brand Components ---

const InputField = ({ label, name, type = 'text', placeholder, required, value, onChange }) => (

    <div className="onboarding-field">

        <label>{label} {required && <span className="req">*</span>}</label>

        <input type={type} name={name} placeholder={placeholder} value={value} onChange={onChange} className="onboarding-input" />

    </div>

);

const SelectField = ({ label, name, options, required, value, onChange }) => (

    <div className="onboarding-field">

        <label>{label} {required && <span className="req">*</span>}</label>

        <div className="onboarding-select-wrapper">

            <select name={name} value={value} onChange={onChange} className="onboarding-select">

                <option value="">Select an option</option>

                {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}

            </select>

        </div>

    </div>

);

const ToggleField = ({ label, name, value, onChange, optional }) => (

    <div className="onboarding-field toggle-field">

        <span className="toggle-name">

            {label} {optional && <span className="opt"></span>}

        </span>

        <button

            type="button"

            role="switch"

            aria-checked={value}

            aria-label={label}

            className="onboarding-toggle-wrapper"

            onClick={() => onChange(name)}

        >

            <span className={`onboarding-toggle ${value ? 'on' : 'off'}`}>

                <span className="toggle-dot"></span>

            </span>

            <span className="toggle-label">{value ? 'Yes' : 'No'}</span>

        </button>

    </div>

);

const FileUpload = ({ label, name, required, note, value, accept, onChange }) => (

    <div className="onboarding-field upload-field">

        <label>{label} {required && <span className="req">*</span>}</label>

        {note && <p className="field-note">{note}</p>}

        <div className="file-upload-box">

            <input type="file" id={name} name={name} accept={accept} onChange={onChange} className="file-input-hidden" />

            <label htmlFor={name} className="file-upload-label">

                <span className="upload-icon">↑</span> {value?.name || 'Choose file'}

            </label>

        </div>

    </div>

);

const VendorOnboarding = () => {

    const [step, setStep] = useState(1);

    const [formData, setFormData] = useState({

        vendorType: '',

        businessName: '',

        yourName: '',

        yearsInBusiness: '',

        teamSize: '',

        description: '',

        gstRegistered: false,

        gstFile: null,

        venueType: '',

        seatingCapacity: '',

        floatingCapacity: '',

        setting: '',

        guestRooms: '',

        cateringPolicy: '',

        decorPolicy: '',

        alcoholPermitted: false,

        alcoholPolicy: '',

        entertainmentPermitted: false,

        amenities: [],

        baseCity: '',

        venueAddress: '',

        startingPrice: '',

        typicalPriceRange: '',

        phone: '',

        email: '',

        sameAsWhatsapp: false,

        whatsapp: '',

        coverPhoto: null,

        website: '',

        instagram: '',

        termsAccepted: false,

    });

    // Ref to the scrollable main area

    const mainRef = useRef(null);

    // Auto-scroll to top whenever the step changes

    useEffect(() => {

        if (mainRef.current) {

            mainRef.current.scrollTo({ top: 0, behavior: 'smooth' });

        }

        // Also scroll the window as a fallback

        window.scrollTo({ top: 0, behavior: 'smooth' });

    }, [step]);

    const steps = [

        'Vendor category',

        'Business Info',

        'Category details',

        'Pricing & availability',

        'Contact & more',

        'Review & submit'

    ];

    const handleChange = (e) => {

        const { name, value, type, checked, files } = e.target;

        const nextValue = type === 'checkbox'

            ? checked

            : type === 'file'

                ? files?.[0] || null

                : value;

        setFormData(prev => ({

            ...prev,

            [name]: nextValue,

            ...(name === 'phone' && prev.sameAsWhatsapp ? { whatsapp: value } : {}),

        }));

    };

    const handleToggle = (name) => {

        setFormData(prev => {

            const value = !prev[name];

            const next = { ...prev, [name]: value };

            if (name === 'gstRegistered' && !value) next.gstFile = null;

            if (name === 'alcoholPermitted' && !value) next.alcoholPolicy = '';

            if (name === 'sameAsWhatsapp') next.whatsapp = value ? prev.phone : '';

            return next;

        });

    };

    const handleNext = () => {

        if (step < 6) setStep(prev => prev + 1);

    };

    const handleBack = () => {

        if (step > 1) setStep(prev => prev - 1);

    };

    const handleSubmit = (e) => {

        e.preventDefault();

        console.log('Form Data Submitted:', formData);

        alert('Application Submitted! Check the console for the complete form data.');

    };

    const updateFormData = (field, value) => {

        setFormData(prev => ({ ...prev, [field]: value }));

    };

    const renderStep1 = () => {

        const categories = [

            { id: 'photography', title: 'Photography & Video', desc: 'Candid, traditional, films', icon: <Camera size={19} /> },

            { id: 'venues', title: 'Venues', desc: 'Banquets, lawns, resorts', icon: <Building size={19} /> },

            { id: 'catering', title: 'Catering', desc: 'Buffets, live counters, meal boxes', icon: <Utensils size={19} /> },

            { id: 'decor', title: 'Decor', desc: 'Stages, mandaps, florals', icon: <Flower2 size={19} /> },

            { id: 'makeup', title: 'Makeup & Hair', desc: 'Bridal, party, groom', icon: <Scissors size={19} /> },

            { id: 'priest', title: 'Priest / Rituals', desc: 'Pandits, poojas, muhurtham', icon: <Flame size={19} /> },

            { id: 'entertainment', title: 'Entertainment & DJ', desc: 'DJs, bands, dhol, dancers', icon: <Music size={19} /> },

            { id: 'mehndi', title: 'Mehndi', desc: 'Bridal & guest mehndi', icon: <Hand size={19} /> },

            { id: 'invitations', title: 'Invitations', desc: 'Cards, e-invites, gifting', icon: <Mail size={19} /> },

            { id: 'transport', title: 'Transport', desc: 'Cars, buses, vintage rides', icon: <Car size={19} /> },

            { id: 'anchor', title: 'Anchor / Host', desc: 'Emcees and hosts', icon: <Mic size={19} /> },

            { id: 'other', title: 'Something else', desc: 'Tell us what you do', icon: <PlusCircle size={19} /> },

        ];

        return (

            <div className="step-content vendor-category-step mb-4">

                <h3>Choose your category</h3>

                <p className="step-desc">Select the service you provide.</p>

                <div className="onboarding-grid vendor-category-grid">

                    {categories.map((cat) => {

                        const selected = formData.vendorType === cat.title;

                        return (

                            <button

                                key={cat.id}

                                type="button"

                                aria-pressed={selected}

                                className={`onboarding-card vendor-category-card ${selected ? 'selected' : ''

                                    }`}

                                onClick={() =>

                                    updateFormData('vendorType', cat.title)

                                }

                            >

                                <span className="card-icon vendor-category-icon">

                                    {cat.icon}

                                </span>

                                <span className="vendor-category-text">

                                    <span className="vendor-category-title">

                                        {cat.title}

                                    </span>

                                    <span className="vendor-category-desc">

                                        {cat.desc}

                                    </span>

                                </span>

                            </button>

                        );

                    })}

                </div>

            </div>

        );

    };

    // ... (Keep all other renderStep functions exactly the same as your current file) ...

    const renderStep2 = () => (

        <div className="step-content">

            <h3 className='pb-1'>Business Info</h3>

            <div className="onboarding-form-grid">

                <InputField label="Business / brand name" name="businessName" placeholder="e.g. Lens & Light Studios" value={formData.businessName} onChange={handleChange} />

                <InputField label="Your name" name="yourName" placeholder="Full name" required value={formData.yourName} onChange={handleChange} />

                <SelectField label="Years in business" name="yearsInBusiness" options={['0-1 years', '1-2 years', '3-5 years', '5+ years']} required value={formData.yearsInBusiness} onChange={handleChange} />

                <SelectField label="Team size" name="teamSize" options={['1-5', '6-15', '16-50', '50+']} required value={formData.teamSize} onChange={handleChange} />

                <div className="onboarding-field textarea-field">

                    <label>Short description of your work</label>

                    <textarea name="description" placeholder="A couple of lines couples should know about you" value={formData.description} onChange={handleChange} className="onboarding-textarea"></textarea>

                </div>

                <ToggleField label="Business registration / GST" name="gstRegistered" value={formData.gstRegistered} onChange={handleToggle} optional />

                {formData.gstRegistered && (

                    <FileUpload

                        label="GST / registration document"

                        name="gstFile"

                        value={formData.gstFile}

                        accept=".pdf,image/*"

                        onChange={handleChange}

                    />

                )}

            </div>

        </div>

    );

    const renderStep3 = () => (

        <div className="step-content">

            <h3>Service details</h3>

            <p className="step-desc">Your specifics</p>

            <div className="onboarding-form-grid">

                <SelectField label="Venue type" name="venueType" options={['Banquet Hall', 'Lawn', 'Resort', 'Hotel', 'Other']} required value={formData.venueType} onChange={handleChange} />

                <InputField label="Seating capacity" name="seatingCapacity" placeholder="e.g. 300" required value={formData.seatingCapacity} onChange={handleChange} />

                <InputField label="Floating capacity" name="floatingCapacity" placeholder="e.g. 700" required value={formData.floatingCapacity} onChange={handleChange} />

                <SelectField label="Setting" name="setting" options={['Indoor', 'Outdoor', 'Both']} required value={formData.setting} onChange={handleChange} />

                <InputField label="Guest rooms available" name="guestRooms" placeholder="e.g. 12" required value={formData.guestRooms} onChange={handleChange} />

                <SelectField label="Catering policy" name="cateringPolicy" options={['In-house', 'Outside allowed', 'Both']} required value={formData.cateringPolicy} onChange={handleChange} />

                <SelectField label="Decor policy" name="decorPolicy" options={['In-house', 'Outside allowed', 'Both']} required value={formData.decorPolicy} onChange={handleChange} />

                <ToggleField label="Alcohol permitted" name="alcoholPermitted" value={formData.alcoholPermitted} onChange={handleToggle} optional />

                {formData.alcoholPermitted && (

                    <SelectField label="Alcohol policy" name="alcoholPolicy" options={['BYOB', 'In-house']} value={formData.alcoholPolicy} onChange={handleChange} />

                )}

                <ToggleField label="Entertainment/DJ permitted" name="entertainmentPermitted" value={formData.entertainmentPermitted} onChange={handleToggle} optional />

                <div className="onboarding-field full-width">

                    <label>Amenities <span className="opt"></span></label>

                    <div className="amenities-wrap">

                        {['Air conditioning', 'Parking', 'Valet', 'Power backup', 'Wi-Fi', 'Bridal room', 'Groom room'].map(amenity => (

                            <button

                                key={amenity} type="button"

                                className={`amenity-pill ${formData.amenities.includes(amenity) ? 'active' : ''}`}

                                onClick={() => {

                                    const newAmenities = formData.amenities.includes(amenity)

                                        ? formData.amenities.filter(a => a !== amenity) : [...formData.amenities, amenity];

                                    updateFormData('amenities', newAmenities);

                                }}

                            >

                                {amenity}

                            </button>

                        ))}

                    </div>

                </div>

            </div>

        </div>

    );

    const renderStep4 = () => (

        <div className="step-content">

            <h3>Address & pricing</h3>

            <p className="step-desc">Where and how much</p>

            <div className="onboarding-form-grid">

                <InputField label="Base city" name="baseCity" placeholder="e.g. Visakhapatnam" required value={formData.baseCity} onChange={handleChange} />

                <div className="onboarding-field textarea-field">

                    <label>Venue address <span className="req">*</span></label>

                    <textarea name="venueAddress" placeholder="Full address with landmark" value={formData.venueAddress} onChange={handleChange} className="onboarding-textarea" required></textarea>

                </div>

                <InputField label="Starting price" name="startingPrice" placeholder="e.g. ₹25,000" required value={formData.startingPrice} onChange={handleChange} />

                <InputField label="Typical price range" name="typicalPriceRange" placeholder="e.g. ₹25,000 – ₹1,50,000" required value={formData.typicalPriceRange} onChange={handleChange} />

            </div>

        </div>

    );

    const renderStep5 = () => (

        <div className="step-content">

            <h3>Contact & more</h3>

            <p className="step-desc">How we reach you</p>

            <div className="onboarding-form-grid">

                <InputField label="Phone number" name="phone" placeholder="10- digit mobile number" required value={formData.phone} onChange={handleChange} />

                <InputField label="Email" name="email" type="email" placeholder="you@business.com" required value={formData.email} onChange={handleChange} />

                <ToggleField label="Phone number same as WhatsApp number" name="sameAsWhatsapp" value={formData.sameAsWhatsapp} onChange={handleToggle} optional />

                {!formData.sameAsWhatsapp && (

                    <InputField label="WhatsApp number" name="whatsapp" placeholder="10- digit mobile number" required value={formData.whatsapp} onChange={handleChange} />

                )}

                <FileUpload

                    label="Cover photo"

                    name="coverPhoto"

                    value={formData.coverPhoto}

                    accept="image/*"

                    required

                    onChange={handleChange}

                />

                <InputField label="Website" name="website" placeholder="https://" value={formData.website} onChange={handleChange} optional />

                <InputField label="Instagram handle" name="instagram" placeholder="@yourstudio" value={formData.instagram} onChange={handleChange} optional />

            </div>

        </div>

    );

    const renderStep6 = () => (

        <div className="step-content">

            <h3>Review</h3>

            <p className="step-desc">Confirm and submit</p>

            <div className="review-block">

                <div className="review-block-header">

                    <h4>Vendor type</h4>

                    <button onClick={() => setStep(1)} className="edit-link">Edit</button>

                </div>

                <div className="review-row"><span>Category</span><span>{formData.vendorType || '-'}</span></div>

            </div>

            <div className="review-block">

                <div className="review-block-header">

                    <h4>Business</h4>

                    <button onClick={() => setStep(2)} className="edit-link">Edit</button>

                </div>

                <div className="review-row"><span>Business / brand name</span><span>{formData.businessName || '-'}</span></div>

                <div className="review-row"><span>Your name</span><span>{formData.yourName || '-'}</span></div>

                <div className="review-row"><span>Years in business</span><span>{formData.yearsInBusiness || '-'}</span></div>

                <div className="review-row"><span>Team size</span><span>{formData.teamSize || '-'}</span></div>

                <div className="review-row"><span>Business registration / GST</span><span>{formData.gstRegistered ? 'Yes' : 'No'}</span></div>

            </div>

            <div className="review-block">

                <div className="review-block-header">

                    <h4>Category details</h4>

                    <button onClick={() => setStep(3)} className="edit-link">Edit</button>

                </div>

                <div className="review-row"><span>Venue type</span><span>{formData.venueType || '-'}</span></div>

                <div className="review-row"><span>Seating capacity</span><span>{formData.seatingCapacity || '-'}</span></div>

                <div className="review-row"><span>Floating capacity</span><span>{formData.floatingCapacity || '-'}</span></div>

                <div className="review-row"><span>Setting</span><span>{formData.setting || '-'}</span></div>

                <div className="review-row"><span>Guest rooms available</span><span>{formData.guestRooms || '-'}</span></div>

            </div>

            <div className="review-block">

                <div className="review-block-header">

                    <h4>Address & pricing</h4>

                    <button onClick={() => setStep(4)} className="edit-link">Edit</button>

                </div>

                <div className="review-row"><span>Base city</span><span>{formData.baseCity || '-'}</span></div>

                <div className="review-row"><span>Venue address</span><span>{formData.venueAddress || '-'}</span></div>

                <div className="review-row"><span>Starting price</span><span>{formData.startingPrice || '-'}</span></div>

                <div className="review-row"><span>Typical price range</span><span>{formData.typicalPriceRange || '-'}</span></div>

            </div>

            <div className="review-block">

                <div className="review-block-header">

                    <h4>Contact & more</h4>

                    <button onClick={() => setStep(5)} className="edit-link">Edit</button>

                </div>

                <div className="review-row"><span>Phone number</span><span>{formData.phone || '-'}</span></div>

                <div className="review-row"><span>Email</span><span>{formData.email || '-'}</span></div>

            </div>

            <div className="terms-box">

                <label>

                    <input type="checkbox" name="termsAccepted" checked={formData.termsAccepted} onChange={handleChange} />

                    I confirm the details above are accurate and agree to Evenddy's <a href="#">partner terms</a> and <a href="#">verification process</a>.

                </label>

            </div>

        </div>

    );

    return (

        <div className="onboarding-layout">

            {/* Sidebar */}

            <aside className="onboarding-sidebar">

                <div className="onboarding-top-nav flex justify-start">

                    <a href="/demo/" className="back-link"> <ArrowLeft size={16} /> Back to Home</a>

                </div>

                <div className="onboarding-stepper">

                    {steps.map((label, index) => {

                        const stepNumber = index + 1;

                        const isActive = step === stepNumber;

                        const isCompleted = step > stepNumber;

                        return (

                            <div key={label} className={`step-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>

                                <div className="step-marker">{isCompleted ? '✓' : stepNumber}</div>

                                <span className="step-name">{label}</span>

                                {index < steps.length - 1 && <div className="step-connector"></div>}

                            </div>

                        );

                    })}

                </div>

            </aside>

            {/* Main Content */}

            <main className="onboarding-main" ref={mainRef}>

                <div className="onboarding-header">

                    <p className="onboarding-eyebrow">Vendor Onboarding</p>

                    <h2>Join the Evenddy vendor network</h2>

                    <p className="onboarding-subtitle">Six short steps, about 4 minutes.</p>

                </div>

                <div className="onboarding-card-wrapper">

                    {step === 1 && renderStep1()}

                    {step === 2 && renderStep2()}

                    {step === 3 && renderStep3()}

                    {step === 4 && renderStep4()}

                    {step === 5 && renderStep5()}

                    {step === 6 && renderStep6()}

                </div>

                <div className="onboarding-footer">

                    {step > 1 ? (

                        <button type="button" className="btn-onboard-outline" onClick={handleBack}>

                            <ArrowLeft size={16} /> Back

                        </button>

                    ) : <div style={{ width: '80px' }}></div>}

                    <span className="step-counter-text">Step {step} of 6</span>

                    {step < 6 ? (

                        <button type="button" className="btn-onboard-primary" onClick={handleNext}>

                            Continue <ArrowRight size={16} />

                        </button>

                    ) : (

                        <button type="button" className="btn-onboard-primary" onClick={handleSubmit}>

                            Submit application <ArrowRight size={16} />

                        </button>

                    )}

                </div>

            </main>

        </div>

    );

};

export default VendorOnboarding;
