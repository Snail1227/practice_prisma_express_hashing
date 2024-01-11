import bcrypt from "bcrypt";

const password = "password";

const timeStart  = Date.now();

// bcrypt.hash(password, 11).then((result) => {
//     const timeEnd = Date.now();
//     const time = (timeEnd - timeStart) / 1000;

//     console.log({ result });
//     console.log("Time takes (in seconds):", time);
// })

bcrypt.compare(password, "$2b$11$jfJ9upmMefk3BX8KYAuGde7FjORr7Bzjq1uqebQlUpCf8ZbVSr3jC").then((result) => {
    const timeEnd = Date.now();
    const time = (timeEnd - timeStart) / 1000;

    console.log({ result });
    console.log("Time takes (in seconds):", time);
})


// saltRound 12 = $2b$12$Z8wCOUSXc0emtpfipvI1N.lS7Vvh21eL/LQni5/iK/FRXM6V.hb5y
//saltRound 11 = $2b$11$9TGUqzziajfxNBAdnul0bOByY.u0duSCGYtEiiaHMEyLVT6dQ3szW