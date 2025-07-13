import React, { useState, useRef, useEffect } from 'react';

const OTPInput = ({ value, onChange, disabled = false }) => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const inputRefs = useRef([]);

    useEffect(() => {
        // Update internal state when value prop changes
        if (value) {
            const otpArray = value.split('').slice(0, 6);
            const newOtp = [...otpArray, ...Array(6 - otpArray.length).fill('')];
            setOtp(newOtp);
        } else {
            setOtp(['', '', '', '', '', '']);
        }
    }, [value]);

    const handleChange = (index, digit) => {
        if (disabled) return;

        // Only allow digits
        if (!/^\d*$/.test(digit)) return;

        const newOtp = [...otp];
        newOtp[index] = digit;
        setOtp(newOtp);

        // Call parent onChange with complete OTP string
        const otpString = newOtp.join('');
        onChange(otpString);

        // Auto-focus next input
        if (digit && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (disabled) return;

        // Handle backspace
        if (e.key === 'Backspace') {
            if (otp[index] === '') {
                // If current input is empty, go to previous input
                if (index > 0) {
                    inputRefs.current[index - 1]?.focus();
                    const newOtp = [...otp];
                    newOtp[index - 1] = '';
                    setOtp(newOtp);
                    onChange(newOtp.join(''));
                }
            } else {
                // Clear current input
                const newOtp = [...otp];
                newOtp[index] = '';
                setOtp(newOtp);
                onChange(newOtp.join(''));
            }
        }
    };

    const handlePaste = (e) => {
        if (disabled) return;

        e.preventDefault();
        const pastedData = e.clipboardData.getData('text/plain');
        const digits = pastedData.replace(/\D/g, '').slice(0, 6);

        const newOtp = [...otp];
        for (let i = 0; i < 6; i++) {
            newOtp[i] = digits[i] || '';
        }
        setOtp(newOtp);
        onChange(newOtp.join(''));

        // Focus the next empty input or the last input
        const nextIndex = Math.min(digits.length, 5);
        inputRefs.current[nextIndex]?.focus();
    };

    return (
        <div className="otp-input-container" style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'center',
            marginBottom: '16px',
            padding: '16px 0'
        }}>
            {otp.map((digit, index) => (
                <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    placeholder="X"
                    maxLength={1}
                    disabled={disabled}
                    className="otp-input"
                    style={{
                        width: '52px',
                        height: '52px',
                        border: '2px solid var(--border-color, #e1e5e9)',
                        borderRadius: '8px',
                        textAlign: 'center',
                        fontSize: '20px',
                        fontWeight: '700',
                        backgroundColor: 'var(--input-bg, #ffffff)',
                        color: 'var(--text-color, #333333)',
                        outline: 'none',
                        transition: 'all 0.2s ease',
                        fontFamily: 'monospace',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                        cursor: disabled ? 'not-allowed' : 'text',
                        opacity: disabled ? 0.6 : 1
                    }}
                    onFocus={(e) => {
                        e.target.style.borderColor = 'var(--primary-color, #007bff)';
                        e.target.style.boxShadow = '0 0 0 3px rgba(0, 123, 255, 0.25)';
                        e.target.style.transform = 'scale(1.05)';
                    }}
                    onBlur={(e) => {
                        e.target.style.borderColor = 'var(--border-color, #e1e5e9)';
                        e.target.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
                        e.target.style.transform = 'scale(1)';
                    }}
                />
            ))}
        </div>
    );
};

export default OTPInput; 