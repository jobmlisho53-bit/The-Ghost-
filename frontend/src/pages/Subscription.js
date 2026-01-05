import React from 'react';

const Subscription = () => {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      features: [
        '10 video requests per month',
        '480p quality',
        'Basic AI models',
        'Standard processing priority'
      ],
      popular: false
    },
    {
      name: 'Premium',
      price: '$9.99',
      period: 'monthly',
      features: [
        'Unlimited video requests',
        '1080p quality',
        'Advanced AI models',
        'Priority processing',
        'Early access to new features'
      ],
      popular: true
    },
    {
      name: 'Enterprise',
      price: '$29.99',
      period: 'monthly',
        features: [
        'Unlimited video requests',
        '4K quality',
        'Custom AI models',
        'Highest processing priority',
        'Dedicated support',
        'API access'
      ],
      popular: false
    }
  ];

  return (
    <div className="main-container">
      <div className="subscription-container">
        <h2 className="section-title">Choose Your Plan</h2>
        <div className="plans-grid">
          {plans.map((plan, index) => (
            <div key={index} className={`plan-card ${plan.popular ? 'popular' : ''}`}>
              {plan.popular && <div className="popular-tag">Most Popular</div>}
              <h3>{plan.name}</h3>
              <div className="price">
                <span className="amount">{plan.price}</span>
                <span className="period">/{plan.period}</span>
              </div>
              <ul className="features-list">
                {plan.features.map((feature, idx) => (
                  <li key={idx}>
                    <i className="fas fa-check"></i> {feature}
                  </li>
                ))}
              </ul>
              <button className={`cta-button ${plan.popular ? 'primary' : 'secondary'}`}>
                <i className="fas fa-credit-card"></i> Select Plan
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Subscription;
