export type Dehype = {
  "version": "0.1.0",
  "name": "dehype",
  "instructions": [
    {
      "name": "initialize",
      "accounts": [
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "configAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "createMarket",
      "accounts": [
        {
          "name": "creator",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "answerAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "marketAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vaultAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "marketKey",
          "type": "u64"
        },
        {
          "name": "title",
          "type": "string"
        },
        {
          "name": "description",
          "type": "string"
        },
        {
          "name": "coverUrl",
          "type": "string"
        },
        {
          "name": "answers",
          "type": {
            "vec": "string"
          }
        },
        {
          "name": "creatorFeePercentage",
          "type": "u64"
        },
        {
          "name": "serviceFeePercentage",
          "type": "u64"
        }
      ]
    },
    {
      "name": "bet",
      "accounts": [
        {
          "name": "voter",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "marketAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "answerAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "betAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vaultAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "anwserKey",
          "type": "u64"
        },
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "retrive",
      "accounts": [
        {
          "name": "voter",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "marketAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "answerAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "betAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vaultAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "anwserKey",
          "type": "u64"
        },
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "answerAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "answers",
            "type": {
              "vec": {
                "defined": "Answer"
              }
            }
          },
          {
            "name": "marketKey",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "bettingAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "marketKey",
            "type": "u64"
          },
          {
            "name": "answerKey",
            "type": "u64"
          },
          {
            "name": "voter",
            "type": "publicKey"
          },
          {
            "name": "tokens",
            "type": "u64"
          },
          {
            "name": "createTime",
            "type": "u64"
          },
          {
            "name": "exist",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "configAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "isInitialized",
            "type": "bool"
          },
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "serviceFeeAccount",
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "marketAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "bumpVault",
            "type": "u8"
          },
          {
            "name": "creator",
            "type": "publicKey"
          },
          {
            "name": "marketKey",
            "type": "u64"
          },
          {
            "name": "title",
            "type": "string"
          },
          {
            "name": "creatorFeePercentage",
            "type": "u64"
          },
          {
            "name": "serviceFeePercentage",
            "type": "u64"
          },
          {
            "name": "marketTotalTokens",
            "type": "u64"
          },
          {
            "name": "marketRemainTokens",
            "type": "u64"
          },
          {
            "name": "description",
            "type": "string"
          },
          {
            "name": "correctAnswerKey",
            "type": "u64"
          },
          {
            "name": "isActive",
            "type": "bool"
          },
          {
            "name": "coverUrl",
            "type": "string"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "Answer",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "answerKey",
            "type": "u64"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "answerTotalTokens",
            "type": "u64"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "AlreadyInitialized",
      "msg": "The configuration account is already initialized."
    },
    {
      "code": 6001,
      "name": "Unauthorized",
      "msg": "You are not authorized to perform this action."
    },
    {
      "code": 6002,
      "name": "AmountZero",
      "msg": "Amount must be greater than 0"
    },
    {
      "code": 6003,
      "name": "MarketNotFinished",
      "msg": "Market/AdjournMarket: Market is not finished"
    },
    {
      "code": 6004,
      "name": "MarketDoesExist",
      "msg": "Market/DraftMarket: Market key does exist"
    },
    {
      "code": 6005,
      "name": "MarketNotApproved",
      "msg": "Market/Bet: Market is not approved"
    },
    {
      "code": 6006,
      "name": "MaxAnswersReached",
      "msg": "The maximum number of answers has been reached."
    },
    {
      "code": 6007,
      "name": "AnswerAlreadyExists",
      "msg": "The answer key already exists."
    },
    {
      "code": 6008,
      "name": "AnswerNotExists",
      "msg": "The answer key does not exist."
    },
    {
      "code": 6009,
      "name": "MarketDoesNotContainAnswerKey",
      "msg": "Market/SuccessMarket: Market does not contain answerKey"
    },
    {
      "code": 6010,
      "name": "CannotClaimToken",
      "msg": "Market/Receive: Cannot receive token"
    },
    {
      "code": 6011,
      "name": "AnswerKeyNotRight",
      "msg": "Market/Receive: Answer key is not succeeded answer key"
    },
    {
      "code": 6012,
      "name": "InsufficientBalance",
      "msg": "Market/Receive: Insufficient balance"
    }
  ]
};

export const IDL: Dehype = {
  "version": "0.1.0",
  "name": "dehype",
  "instructions": [
    {
      "name": "initialize",
      "accounts": [
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "configAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "createMarket",
      "accounts": [
        {
          "name": "creator",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "answerAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "marketAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vaultAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "marketKey",
          "type": "u64"
        },
        {
          "name": "title",
          "type": "string"
        },
        {
          "name": "description",
          "type": "string"
        },
        {
          "name": "coverUrl",
          "type": "string"
        },
        {
          "name": "answers",
          "type": {
            "vec": "string"
          }
        },
        {
          "name": "creatorFeePercentage",
          "type": "u64"
        },
        {
          "name": "serviceFeePercentage",
          "type": "u64"
        }
      ]
    },
    {
      "name": "bet",
      "accounts": [
        {
          "name": "voter",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "marketAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "answerAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "betAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vaultAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "anwserKey",
          "type": "u64"
        },
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "retrive",
      "accounts": [
        {
          "name": "voter",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "marketAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "answerAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "betAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vaultAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "anwserKey",
          "type": "u64"
        },
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "answerAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "answers",
            "type": {
              "vec": {
                "defined": "Answer"
              }
            }
          },
          {
            "name": "marketKey",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "bettingAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "marketKey",
            "type": "u64"
          },
          {
            "name": "answerKey",
            "type": "u64"
          },
          {
            "name": "voter",
            "type": "publicKey"
          },
          {
            "name": "tokens",
            "type": "u64"
          },
          {
            "name": "createTime",
            "type": "u64"
          },
          {
            "name": "exist",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "configAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "isInitialized",
            "type": "bool"
          },
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "serviceFeeAccount",
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "marketAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "bumpVault",
            "type": "u8"
          },
          {
            "name": "creator",
            "type": "publicKey"
          },
          {
            "name": "marketKey",
            "type": "u64"
          },
          {
            "name": "title",
            "type": "string"
          },
          {
            "name": "creatorFeePercentage",
            "type": "u64"
          },
          {
            "name": "serviceFeePercentage",
            "type": "u64"
          },
          {
            "name": "marketTotalTokens",
            "type": "u64"
          },
          {
            "name": "marketRemainTokens",
            "type": "u64"
          },
          {
            "name": "description",
            "type": "string"
          },
          {
            "name": "correctAnswerKey",
            "type": "u64"
          },
          {
            "name": "isActive",
            "type": "bool"
          },
          {
            "name": "coverUrl",
            "type": "string"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "Answer",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "answerKey",
            "type": "u64"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "answerTotalTokens",
            "type": "u64"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "AlreadyInitialized",
      "msg": "The configuration account is already initialized."
    },
    {
      "code": 6001,
      "name": "Unauthorized",
      "msg": "You are not authorized to perform this action."
    },
    {
      "code": 6002,
      "name": "AmountZero",
      "msg": "Amount must be greater than 0"
    },
    {
      "code": 6003,
      "name": "MarketNotFinished",
      "msg": "Market/AdjournMarket: Market is not finished"
    },
    {
      "code": 6004,
      "name": "MarketDoesExist",
      "msg": "Market/DraftMarket: Market key does exist"
    },
    {
      "code": 6005,
      "name": "MarketNotApproved",
      "msg": "Market/Bet: Market is not approved"
    },
    {
      "code": 6006,
      "name": "MaxAnswersReached",
      "msg": "The maximum number of answers has been reached."
    },
    {
      "code": 6007,
      "name": "AnswerAlreadyExists",
      "msg": "The answer key already exists."
    },
    {
      "code": 6008,
      "name": "AnswerNotExists",
      "msg": "The answer key does not exist."
    },
    {
      "code": 6009,
      "name": "MarketDoesNotContainAnswerKey",
      "msg": "Market/SuccessMarket: Market does not contain answerKey"
    },
    {
      "code": 6010,
      "name": "CannotClaimToken",
      "msg": "Market/Receive: Cannot receive token"
    },
    {
      "code": 6011,
      "name": "AnswerKeyNotRight",
      "msg": "Market/Receive: Answer key is not succeeded answer key"
    },
    {
      "code": 6012,
      "name": "InsufficientBalance",
      "msg": "Market/Receive: Insufficient balance"
    }
  ]
};
