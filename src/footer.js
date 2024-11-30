import React, { useEffect } from 'react';

const FooterComponent = () => {
  useEffect(() => {
    // Example: Add behavior for scroll-to-top button
    const progressWrap = document.querySelector('.progress-wrap');
    const path = document.querySelector('.progress-wrap path');
    const offset = path.getTotalLength();

    path.style.transition = path.style.WebkitTransition = 'none';
    path.style.strokeDasharray = `${offset} ${offset}`;
    path.style.strokeDashoffset = offset;
    path.getBoundingClientRect();
    path.style.transition = path.style.WebkitTransition = 'stroke-dashoffset 10ms linear';

    const updateProgress = () => {
      const scroll = window.scrollY;
      const height = document.documentElement.scrollHeight - window.innerHeight;
      const progress = offset - (scroll * offset) / height;
      path.style.strokeDashoffset = progress;
    };

    window.addEventListener('scroll', updateProgress);

    // Scroll to top on button click
    const handleScrollToTop = () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (progressWrap) {
      progressWrap.addEventListener('click', handleScrollToTop);
    }

    return () => {
      window.removeEventListener('scroll', updateProgress);
      if (progressWrap) {
        progressWrap.removeEventListener('click', handleScrollToTop);
      }
    };
  }, []);

  return (
    <footer className="footer">
      <div className="inner-footer">
        <div className="container">
          <div className="row">
            {/* Contact Us Section */}
            <div className="col-lg-4 col-md-6">
              <div className="footer-cl-1">
                <div className="fw-7 text-white">Contact Us</div>
                <ul className="mt-12">
                  <li className="mt-12 d-flex align-items-center gap-8">
                    <i className="icon icon-mapPinLine fs-20 text-variant-2"></i>
                    <p className="text-white">123 Main St, City, Country</p>
                  </li>
                  <li className="mt-12 d-flex align-items-center gap-8">
                    <i className="icon icon-phone2 fs-20 text-variant-2"></i>
                    <a href="tel:1-333-345-6868" className="text-white caption-1">
                      +1-333-345-6868
                    </a>
                  </li>
                  <li className="mt-12 d-flex align-items-center gap-8">
                    <i className="icon icon-mail fs-20 text-variant-2"></i>
                    <p className="text-white">contact@example.com</p>
                  </li>
                </ul>
              </div>
            </div>

            {/* Quick Links Section */}
            <div className="col-lg-2 col-md-6 col-6">
              <div className="footer-cl-2">
                <div className="fw-7 text-white">Quick Links</div>
                <ul className="mt-12 navigation-menu-footer">
                  <li><a href="/about" className="caption-1 text-variant-2">About Us</a></li>
                  <li><a href="/agents" className="caption-1 text-variant-2">Find An Agent</a></li>
                  <li><a href="/faq" className="caption-1 text-variant-2">FAQ</a></li>
                  <li><a href="/contact" className="caption-1 text-variant-2">Contact Us</a></li>
                </ul>
              </div>
            </div>

            {/* Sublease Section */}
            <div className="col-lg-2 col-md-4 col-6">
              <div className="footer-cl-3">
                <div className="fw-7 text-white">Sublease</div>
                <ul className="mt-12 navigation-menu-footer">
                  <li><a href="/search?type=1" className="caption-1 text-variant-2">Type 1</a></li>
                  <li><a href="/search?type=2" className="caption-1 text-variant-2">Type 2</a></li>
                </ul>
              </div>
            </div>

            {/* Newsletter Section */}
            <div className="col-lg-4 col-md-6">
              <div className="footer-cl-4">
                <div className="fw-7 text-white">Newsletter</div>
                <p className="mt-12 text-variant-2">Stay updated with our latest news and offers.</p>
                <form className="mt-12" id="subscribe-form">
                  <div id="subscribe-content">
                    <span className="icon-left icon-mail"></span>
                    <input
                      type="email"
                      name="email"
                      id="subscribe-email"
                      placeholder="Your email address"
                      required
                    />
                    <button type="submit" id="subscribe-button" className="button-subscribe">
                      <i className="icon icon-send"></i>
                    </button>
                  </div>
                  <div id="subscribe-msg"></div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="bottom-footer">
        <div className="container">
          <div className="content-footer-bottom">
            <div className="copyright">© 2024 Your Company. All rights reserved.</div>
            <ul className="menu-bottom">
              <li><a href="/terms">Terms Of Services</a></li>
              <li><a href="/privacy-policy">Privacy Policy</a></li>
              <li><a href="/cookie-policy">Cookie Policy</a></li>
              <li><a href="/lease-agreement">Lease Agreement</a></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      <div className="progress-wrap">
        <svg className="progress-circle svg-content" width="100%" height="100%" viewBox="-1 -1 102 102">
          <path d="M50,1 a49,49 0 0,1 0,98 a49,49 0 0,1 0,-98"></path>
        </svg>
      </div>
    </footer>
  );
};

export default FooterComponent;
