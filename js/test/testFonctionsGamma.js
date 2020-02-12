//Un petit test pour faire la comparaison avec ce que produit R
JSgamma =  [];
JSlgamma = [];
vi = [];
for (i = -5; i <= 5; i = Math.round10(i + .1, -1)) {
    vi.push(i);
}

JSgamma = vi.map(ind => zNum.gamma(ind));
JSlgamma = vi.map(ind => zNum.logGamma(ind));

/*
    on transfèrera les 3 tableaux dans Ré
*/

copy("vi = " + zU.toR(vi)); /* collage dans R*/
copy("JSgamma = " + zU.toR(JSgamma)); /* collage dans R*/
copy("JSlgamma = " + zU.toR(JSlgamma)); /* collage dans R*/

    

/*
    #Dans R
    Rgamma = gamma(vi) 
    Rlgamma = lgamma(vi)

    R = Rgamma
    JS = JSgamma
    mean( abs((JS-R)/R),na.rm = T) # === 0
    max( abs((JS-R)/R),na.rm = T)  # === 0

    R = Rlgamma
    JS = JSlgamma
    mean( abs((JS-R)/R),na.rm = T) #  === 1.2134814794599151e-17
    max( abs((JS-R)/R),na.rm = T) # === 1.9397117841496045e-16

  

*/
