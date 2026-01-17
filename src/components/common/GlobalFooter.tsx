const GlobalFooter = () => {
  return (
    <footer className="min-footer border-t border-border bg-amber-50 px-4 py-4 pb-24">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="col-left text-center set-cont-mb-s reset-last-child text-xs text-muted-foreground">
          <small>©2017 Perfect Gift SRL (CUI: RO37811834). Toate drepturile rezervate. Marca inregistrata nr.160868</small>
        </div>
        <div className="col-right set-cont-mb-s reset-last-child flex flex-col items-start gap-2 sm:items-end">
          <img

            loading="lazy"
            className="lazyloading m-auto"
            src="https://darurialese.ro/wp-content/uploads/2020/02/payments.png"
            alt="payments"
          />
          <div className="anpcFiles flex items-center gap-5">
            <a
              target="_blank"
              rel="noreferrer"
              href="https://ec.europa.eu/consumers/odr/main/index.cfm?event=main.home2.show&lng=RO"
            >
              <img
                alt="anpc sol"
                src="https://darurialese.ro/wp-content/uploads/2022/09/300400833_5431249810274994_5748578706833202629_n.jpeg"
                className="anpcsol"
              />
            </a>
            <a target="_blank" rel="noreferrer" href="https://anpc.ro/ce-este-sal/">
              <img
                src="https://darurialese.ro/wp-content/uploads/2022/09/299936621_5431249816941660_5345338763686279853_n.jpeg"
                className="anpcsal"
                alt="anpc sal"
              />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default GlobalFooter;
