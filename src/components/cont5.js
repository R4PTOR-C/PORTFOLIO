// CollegeContentPage.js
import React, { useEffect } from 'react';

const Cont5 = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);
    return (
        <div className="container">


            <h1 className="title">CLASSES P, NP E NP-COMPLETO</h1>
            <p className="aboutPara">
                P é a classe de problemas de decisão (ou otimização) que podem ser resolvidos em tempo polinomial por um algoritmo determinístico. Isso significa que o tempo de execução do algoritmo cresce de forma limitada à medida que o tamanho da entrada aumenta.
                Problemas em P são considerados "eficientemente solucionáveis".
                Classe NP:

                NP é a classe de problemas de decisão para os quais uma solução candidata pode ser verificada em tempo polinomial. Se alguém propõe uma solução, você pode verificar sua validade rapidamente.
                NP inclui problemas cujas soluções não são necessariamente fáceis de encontrar, mas são fáceis de verificar uma vez encontradas.
                Classe NP-completo:

                Os problemas NP-completos são uma classe especial de problemas em NP que são tão difíceis quanto os problemas mais difíceis em NP. Se um problema NP-completo pudesse ser resolvido em tempo polinomial, todos os problemas em NP poderiam ser resolvidos em tempo polinomial, o que implicaria P = NP.
                Os problemas NP-completos são intrinsecamente difíceis de resolver, e encontrar algoritmos eficientes para eles é um desafio não resolvido na ciência da computação.
                Resumindo, a classe P consiste em problemas que podem ser resolvidos eficientemente, a classe NP inclui problemas cujas soluções podem ser verificadas eficientemente, e a classe NP-completo contém problemas tão difíceis que, se pudessem ser resolvidos eficientemente, todos os problemas NP seriam resolvidos da mesma forma. Portanto, a questão de se P é igual a NP (P = NP) é uma questão fundamental e em aberto na teoria da complexidade computacional.
            </p>


        </div>
    );
};

export default Cont5;
