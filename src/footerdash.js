import React from 'react';

const FooterDashboard = () => {
  return (
    <div>
      {/* Footer */}
      <div className="footer-dashboard">
        <p className="text-variant-2">©2024 Subliva. All Rights Reserved.</p>
      </div>

      {/* Page Wrapper End */}
      <div className="progress-wrap">
        <svg
          className="progress-circle svg-content"
          width="100%"
          height="100%"
          viewBox="-1 -1 102 102"
        >
          <path
            d="M50,1 a49,49 0 0,1 0,98 a49,49 0 0,1 0,-98"
            style={{
              transition: 'stroke-dashoffset 10ms linear 0s',
              strokeDasharray: '307.919, 307.919',
              strokeDashoffset: '286.138',
            }}
          />
        </svg>
      </div>

      {/* Javascript dependencies */}
      <script type="text/javascript" src="js/bootstrap.min.js"></script>
      <script type="text/javascript" src="js/jquery.min.js"></script>
      <script type="text/javascript" src="js/plugin.js"></script>
      <script type="text/javascript" src="js/chart.js"></script>
      <script type="text/javascript" src="js/chart-init.js"></script>
      <script type="text/javascript" src="js/jquery.nice-select.min.js"></script>
      <script type="text/javascript" src="js/countto.js"></script>
      <script type="text/javascript" src="js/shortcodes.js"></script>
      <script type="text/javascript" src="js/jqueryui.min.js"></script>
      <script type="text/javascript" src="js/main.js"></script>
    </div>
  );
};

export default FooterDashboard;
