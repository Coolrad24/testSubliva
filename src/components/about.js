import React from 'react';

const AboutUs = () => {
  return (
    <>
      {/* Page Title */}
      <section className="flat-title-page style-2 bg-white">
        <div className="container">
          <h2 className="text-center">About Us</h2>
        </div>
      </section>

      {/* Service Section */}
      <section className="flat-section-v3 flat-service-v2 bg-surface">
        <div className="container">
          <div className="row wrap-service-v2">
            <div className="col-lg-6">
              <div className="box-left">
                <p>
                  Welcome to Subliva, your ultimate destination for finding the perfect sublease. Our platform is dedicated to simplifying the subleasing process for everyone. Whether you're looking to sublease your space or searching for a sublease, we offer comprehensive listings and personalized recommendations to meet your needs.
                </p>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="box-right">
                <div className="box-service style-1 hover-btn-view">
                  <div className="icon-box">
                    <span className="icon icon-apartment"></span>
                  </div>
                  <div className="content">
                    <h6 className="title">Lease a Property</h6>
                    <p className="description">Explore diverse properties and expert guidance for a seamless leasing experience.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="flat-section-v3 flat-slider-contact">
        <div className="container">
          <div className="row content-wrap">
            <div className="col-lg-12">
              <p className="body-2 text-white mb20">
                At Subliva, we understand that finding the right space can be challenging. That's why we're committed to providing a seamless and efficient experience, connecting you to the right space with ease and confidence. Our user-friendly platform ensures that you have access to the most up-to-date listings and resources.
              </p>
              <p className="body-2 text-white">
                Our mission is to revolutionize the subleasing market by offering a one-stop solution for all your subleasing needs. From listing your property to finding a roommate, Subliva is here to help you every step of the way.
              </p>
            </div>
          </div>
        </div>
        <div className="overlay"></div>
      </section>

      {/* Banner Section */}
      <section className="flat-section pt-0 flat-banner">
        <div className="container">
          <div className="wrap-banner bg-surface">
            <div className="box-left">
              <div className="box-title">
                <h4 className="mt-4">Get Sublease Recommendations</h4>
                <div className="text-subtitle">Sign in for a more personalized experience.</div>
              </div>
            </div>
            <div className="box-right">
              <img src="subliva\images\banner\banner.png" alt="Sublease Banner" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default AboutUs;
