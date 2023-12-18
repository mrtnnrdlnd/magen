# MaGen
Ett litet javascript projekt för att generera matris-multiplikations-läxa.

Använd genom att modifiera url parametrarna A, B, fill, hide och seed  
?  
  A=dimensioner matris A &  
  B=dimensioner matris B &  
  fill=index / random fyllnad av matris &  
  hide=göm siffror i matris A,B eller C (resultat matrisen)&  
  seed=seed till random fill, om man sätter "date" kommer den sätta dagens datum som seed, formaterat ÅÅÅÅ-MM-DD


## Exempel

Ekvationslösning  
https://mrtnnrdlnd.github.io/magen/?A=2,1&B=2,2&fill=random&hide=A

Matrismultiplikation 4x4 matriser slumpade tal 0-9  
https://mrtnnrdlnd.github.io/magen/?A=4,4&B=4,4&fill=random&hide=C

Matrismultiplikation 1x9 * 9x1 matriser med index-fyllnad. Multiplikationstabell.  
https://mrtnnrdlnd.github.io/magen/?A=1,9&B=9,1&fill=index&hide=C

Matrismultiplikation 1x1 * 9x1 matriser med index-fyllnad. Lära skriva siffror.  
https://mrtnnrdlnd.github.io/magen/?A=1,1&B=9,1&fill=index&hide=C
